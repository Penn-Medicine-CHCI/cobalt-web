import React, { FC, PropsWithChildren, useRef, useState } from 'react';
import { Form, Button } from 'react-bootstrap';

import Select from '@/components/select';
import DatePicker from '@/components/date-picker';

import { AssessmentQuestion, QUESTION_TYPE, SelectedQuestionAnswer } from '@/lib/models';
import { formatISO, parseISO } from 'date-fns';

interface SurveyQuestionProps extends PropsWithChildren {
	question: AssessmentQuestion;
	onChange(questionId: string, answerIds: SelectedQuestionAnswer[]): void;
}

const SurveyQuestion: FC<SurveyQuestionProps> = ({ question, onChange, children }) => {
	const checkboxRefs = useRef<React.RefObject<HTMLInputElement>[]>([]).current;
	const radioRefs = useRef<React.RefObject<HTMLInputElement>[]>([]).current;
	const [answersTextValues, setAnswersTextValues] = useState(
		question.selectedAssessmentAnswers.reduce((acc, answer) => {
			acc[answer.answerId] = answer.answerText || '';

			return acc;
		}, {} as Record<string, string>)
	);

	function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>, question: AssessmentQuestion) {
		const answerId = event.currentTarget.value;
		const { questionId } = question;

		onChange(questionId, [{ answerId }]);
	}

	function handleCheckboxChange(_event: React.ChangeEvent<HTMLInputElement>, question: AssessmentQuestion) {
		const checkedCheckboxes = checkboxRefs.filter((checkbox) => checkbox.current?.checked);
		const checkedAnswers = checkedCheckboxes.map((checkbox) => ({ answerId: checkbox.current?.value! }));
		const { questionId } = question;

		onChange(questionId, checkedAnswers);
	}

	function handleRadioChange(_event: React.ChangeEvent<HTMLInputElement>, question: AssessmentQuestion) {
		const checkedRadio = radioRefs.find((radio) => radio.current?.checked);
		const checkedAnswer = checkedRadio?.current?.value;
		const { questionId } = question;

		onChange(questionId, checkedAnswer ? [{ answerId: checkedAnswer }] : []);
	}

	function handleQuadButtonClick(
		event: React.MouseEvent<HTMLButtonElement>,
		question: AssessmentQuestion,
		answerId: string
	) {
		event.preventDefault();

		const { questionId } = question;

		onChange(questionId, [{ answerId }]);
	}

	function handleAnswerTextChange(questionId: string, answerId: string, answerText: string) {
		setAnswersTextValues({
			...answersTextValues,
			[answerId]: answerText,
		});

		onChange(questionId, [{ answerId, answerText }]);
	}

	function getInputTypeForQuestion() {
		switch (question.questionType) {
			case QUESTION_TYPE.DROPDOWN:
				return (
					<Select
						value={question.selectedAssessmentAnswers[0].answerId}
						onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleSelectChange(event, question)}
					>
						{question.answers.map((answer) => {
							return (
								<option key={answer.answerId} value={answer.answerId}>
									{answer.answerDescription}
								</option>
							);
						})}
					</Select>
				);
			case QUESTION_TYPE.CHECKBOX:
				return question.answers.map((answer) => {
					const checkboxRef = React.createRef<HTMLInputElement>();
					checkboxRefs.push(checkboxRef);

					return (
						<Form.Check
							key={`${question.questionId}-${answer.answerId}`}
							ref={checkboxRef as any}
							bsPrefix="cobalt-survey-form__check"
							type="checkbox"
							checked={!!question.selectedAssessmentAnswers.find((a) => a.answerId === answer.answerId)}
							id={`${question.questionId}-${answer.answerId}`}
							value={answer.answerId}
							name={question.questionId}
							label={answer.answerDescription}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
								handleCheckboxChange(event, question)
							}
						/>
					);
				});
			case QUESTION_TYPE.RADIO:
				return question.answers.map((answer) => {
					const radioRef = React.createRef<HTMLInputElement>();
					radioRefs.push(radioRef);

					return (
						<Form.Check
							key={`${question.questionId}-${answer.answerId}`}
							ref={radioRef as any}
							bsPrefix="cobalt-survey-form__check"
							type="radio"
							checked={!!question.selectedAssessmentAnswers.find((a) => a.answerId === answer.answerId)}
							id={`${question.questionId}-${answer.answerId}`}
							value={answer.answerId}
							name={question.questionId}
							label={answer.answerDescription}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
								handleRadioChange(event, question)
							}
						/>
					);
				});
			case QUESTION_TYPE.QUAD:
				return (
					<div className="d-grid gap-4">
						{question.answers.map((answer) => {
							return (
								<Button
									variant={
										!!question.selectedAssessmentAnswers.find((a) => a.answerId === answer.answerId)
											? 'primary'
											: 'light'
									}
									key={answer.answerId}
									onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
										handleQuadButtonClick(event, question, answer.answerId)
									}
								>
									{answer.answerDescription}
								</Button>
							);
						})}
					</div>
				);
			case QUESTION_TYPE.TEXT:
			case QUESTION_TYPE.COBALT_STUDENT_ID:
			case QUESTION_TYPE.PHONE_NUMBER:
				return question.answers.map((answer) => {
					return (
						<Form.Control
							key={answer.answerId}
							required
							type="text"
							value={answersTextValues[answer.answerId] || ''}
							className="mb-2"
							placeholder={answer.answerDescription}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								handleAnswerTextChange(question.questionId, answer.answerId, e.target.value);
							}}
						/>
					);
				});
			case QUESTION_TYPE.DATE:
				return question.answers.map((answer) => {
					return (
						<DatePicker
							showYearDropdown
							showMonthDropdown
							dropdownMode="select"
							key={answer.answerId}
							selected={
								answersTextValues[answer.answerId]
									? parseISO(answersTextValues[answer.answerId])
									: undefined
							}
							onChange={(date) => {
								handleAnswerTextChange(
									question.questionId,
									answer.answerId,
									date ? formatISO(date, { representation: 'date' }) : ''
								);
							}}
						/>
					);
				});
			default:
				return null;
		}
	}

	return (
		<Form.Group key={question.questionId} controlId={question.questionId} className="mb-5">
			<Form.Label
				className={question.fontSizeId === 'SMALL' ? 'fs-default' : ''}
				dangerouslySetInnerHTML={{
					__html: question.questionTitle,
				}}
			/>
			<div>{children}</div>
			{getInputTypeForQuestion()}
		</Form.Group>
	);
};

export default SurveyQuestion;
