import React, { FC, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { feedbackService } from '@/lib/services/feedback-service';
import useHandleError from '@/hooks/use-handle-error';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import useAccount from '@/hooks/use-account';
import InputHelper from '@/components/input-helper';

const Feedback: FC = () => {
	const handleError = useHandleError();
	const { openInCrisisModal } = useInCrisisModal();
	const { subdomainInstitution } = useAccount();

	const [feedbackEmailValue, setFeedbackEmailValue] = useState('');
	const [feedbackTextareaValue, setFeedbackTextareaValue] = useState<string>('');
	const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

	async function handleSubmitFeedbackButtonClick() {
		try {
			await feedbackService.submitFeedback(feedbackEmailValue, feedbackTextareaValue).fetch();
			setFeedbackEmailValue('');
			setFeedbackTextareaValue('');
			setFeedbackSubmitted(true);
		} catch (error) {
			handleError(error);
			setFeedbackSubmitted(false);
		}
	}

	return (
		<>
			{feedbackSubmitted && (
				<Container fluid className="bg-success p-0">
					<Container className="pt-3 pb-1">
						<Row>
							<Col>
								<h6 className="mb-0 text-center text-white mb-2">your feedback has been sent</h6>
							</Col>
						</Row>
					</Container>
				</Container>
			)}
			<Container className="pt-4">
				<Row className="mb-4">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{subdomainInstitution?.institutionId === 'COBALT' && (
							<p className="mb-4">
								<strong>
									This form is not for clinical concerns. If you'd like mental health support, please{' '}
									<a href="tel:215-555-1212">call 215-555-1212</a>.
								</strong>
							</p>
						)}
						<p className="mb-4">
							If you are in immediate crisis,{' '}
							<span
								className="text-primary text-decoration-underline cursor-pointer"
								tabIndex={0}
								onClick={() => openInCrisisModal()}
							>
								please contact these resources.
							</span>
						</p>
						<InputHelper
							className="mb-1"
							type="email"
							value={feedbackEmailValue}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								setFeedbackEmailValue(event.currentTarget.value);
							}}
							label="Your email address"
						/>
						<small className="d-block ps-2 pe-2 mb-5">
							Enter your email address if you would like our team to follow up in the next two business
							days
						</small>
						<InputHelper
							as="textarea"
							label="Your technical issue or feedback"
							value={feedbackTextareaValue}
							onChange={(event) => {
								setFeedbackTextareaValue(event.currentTarget.value);
							}}
						/>
					</Col>
				</Row>
				<Row className="text-center">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Button variant="primary" onClick={handleSubmitFeedbackButtonClick}>
							submit
						</Button>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default Feedback;
