import cloneDeep from 'lodash/cloneDeep';
import React, { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import Cookies from 'js-cookie';
import classNames from 'classnames';

import useHeaderTitle from '@/hooks/use-header-title';
import useAccount from '@/hooks/use-account';
import useQuery from '@/hooks/use-query';

import AsyncPage from '@/components/async-page';
import SurveyQuestion from '@/components/survey-question';

import { assessmentService, accountService } from '@/lib/services';
import { Assessment, QUESTION_TYPE, SelectedQuestionAnswer } from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';

interface HistoryLocationState {
	from?: string;
}

const IntroAssessment: FC = () => {
	useHeaderTitle('assessment');

	const handleError = useHandleError();
	const history = useHistory<HistoryLocationState>();
	const { account, setAccount } = useAccount();
	const query = useQuery();
	const questionId = query.get('questionId');
	const sessionId = query.get('sessionId');

	const [assessment, setAssessment] = useState<Assessment | undefined>();
	const [answerChangedByUser, setAnswerChangedByUser] = useState<boolean>(false);

	const questionRequest = useMemo(() => {
		return assessmentService.getIntroAssessmentQuestion(questionId, sessionId);
	}, [questionId, sessionId]);

	const fetchData = useCallback(async () => {
		const response = await questionRequest.fetch();

		setAnswerChangedByUser(false);
		setAssessment(response.assessment);
	}, [questionRequest]);

	const submitAnswer = useCallback(async () => {
		if (!assessment) return;

		try {
			await assessmentService
				.submitIntroAssessmentQuestion({
					assessmentAnswers: assessment.question.selectedAssessmentAnswers,
					questionId: assessment.question.questionId,
					sessionId: assessment.sessionId,
				})
				.fetch();
		} catch (error) {
			throw error;
		}
	}, [assessment]);

	const navigateForward = useCallback(async () => {
		if (!assessment) return;

		if (assessment.nextQuestionId) {
			const searchParams = new URLSearchParams({
				questionId: assessment.nextQuestionId,
				sessionId: assessment.sessionId,
			});

			history.push({
				pathname: '/intro-assessment',
				search: '?' + searchParams.toString(),
				state: history.location.state,
			});
		} else {
			if (account) {
				const response = await accountService.account(account.accountId).fetch();

				setAccount(response.account);
			}

			const authRedirectUrl = Cookies.get('authRedirectUrl');

			let redirectUrl = authRedirectUrl || history.location.state?.from || '/';

			history.push(redirectUrl);
			Cookies.remove('authRedirectUrl');
		}
	}, [account, assessment, history, setAccount]);

	const navigateBackwards = useCallback(() => {
		if (!assessment) return;

		if (assessment.previousQuestionId) {
			history.push(`/intro-assessment?questionId=${assessment.previousQuestionId}&sessionId=${assessment.sessionId}`);
		}
	}, [assessment, history]);

	// Need to use this as a sort of psuedo click handler for QUAD question types
	useEffect(() => {
		if (!assessment) return;
		if (assessment.question.questionType !== QUESTION_TYPE.QUAD) return;
		if (!assessment.question.selectedAssessmentAnswers) return;
		if (!assessment.question.selectedAssessmentAnswers.length) return;
		if (!answerChangedByUser) return;

		async function submitAnswerAndNavigateForwards() {
			try {
				await submitAnswer();
				navigateForward();
			} catch (error) {
				handleError(error);
			}
		}

		submitAnswerAndNavigateForwards();
	}, [answerChangedByUser, assessment, handleError, navigateForward, submitAnswer]);

	function handleSurveyQuestionChange(_questionId: string, selectedAssessmentAnswers: SelectedQuestionAnswer[]) {
		if (!assessment) return;
		const assessmentClone = cloneDeep(assessment);

		assessmentClone.question.selectedAssessmentAnswers = selectedAssessmentAnswers;

		setAnswerChangedByUser(true);
		setAssessment(assessmentClone);
	}

	async function handleBackButtonClick() {
		if (!assessment) return;

		if (assessment.question.selectedAssessmentAnswers && assessment.question.selectedAssessmentAnswers.length) {
			try {
				await submitAnswer();
				navigateBackwards();
			} catch (error) {
				handleError(error);
			}
		} else {
			navigateBackwards();
		}
	}

	async function handleNextButtonClick() {
		try {
			await submitAnswer();
			navigateForward();
		} catch (error) {
			handleError(error);
		}
	}

	if (!account) {
		// Hold off async page / initial data fetch until
		// the account is in context and we know whether
		// the user needs to stay on this page or get redirected
		return null;
	}

	return (
		<AsyncPage fetchData={fetchData} abortFetch={questionRequest.abort}>
			<Container className="pt-5 pb-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Form>
							{assessment?.question && (
								<SurveyQuestion key={assessment.question.questionId} question={assessment.question} onChange={handleSurveyQuestionChange} />
							)}
							<div
								className={classNames({
									'd-flex': true,
									'justify-content-end': !assessment?.previousQuestionId,
									'justify-content-between': assessment?.previousQuestionId,
								})}
							>
								{assessment?.previousQuestionId && (
									<Button variant="outline-primary" onClick={handleBackButtonClick}>
										back
									</Button>
								)}
								{assessment?.question.questionType !== QUESTION_TYPE.QUAD && (
									<Button variant="primary" onClick={handleNextButtonClick}>
										{assessment?.nextQuestionId ? 'next' : 'done'}
									</Button>
								)}
							</div>
						</Form>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default IntroAssessment;
