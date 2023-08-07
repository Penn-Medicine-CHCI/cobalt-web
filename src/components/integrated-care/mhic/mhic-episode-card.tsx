import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

import { PatientOrderDispositionId, PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import { MhicCloseEpisodeModal, MhicInlineAlert } from '@/components/integrated-care/mhic';
import { useRevalidator } from 'react-router-dom';

interface MhicEpisodeCardProps {
	patientOrder: PatientOrderModel;
}

export const MhicEpisodeCard = ({ patientOrder }: MhicEpisodeCardProps) => {
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [showCloseEpisodeModal, setShowCloseEpisodeModal] = useState(false);
	const revalidator = useRevalidator();

	const handleCloseEpisodeModalSave = useCallback(
		async (patientOrderClosureReasonId: string) => {
			try {
				await integratedCareService
					.closePatientOrder(patientOrder.patientOrderId, { patientOrderClosureReasonId })
					.fetch();

				setShowCloseEpisodeModal(false);
				addFlag({
					variant: 'success',
					title: 'Episode Closed',
					actions: [],
				});

				revalidator.revalidate();
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, patientOrder.patientOrderId, revalidator]
	);

	const handleReopenButtonClick = useCallback(async () => {
		try {
			await integratedCareService.openPatientOrder(patientOrder.patientOrderId).fetch();

			addFlag({
				variant: 'success',
				title: 'Episode Reopened',
				actions: [],
			});

			revalidator.revalidate();
		} catch (error) {
			handleError(error);
		}
	}, [addFlag, handleError, patientOrder.patientOrderId, revalidator]);

	return (
		<>
			<MhicCloseEpisodeModal
				show={showCloseEpisodeModal}
				onHide={() => {
					setShowCloseEpisodeModal(false);
				}}
				onSave={handleCloseEpisodeModalSave}
			/>

			<Card bsPrefix="ic-card">
				<Card.Header>
					<Card.Title>
						{patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED ||
						patientOrder.patientOrderDispositionId === PatientOrderDispositionId.ARCHIVED
							? `${patientOrder.orderDateDescription} - ${patientOrder.episodeClosedAtDescription}`
							: 'Order'}{' '}
						<span className="text-gray">(Episode: {patientOrder.episodeDurationInDaysDescription})</span>
					</Card.Title>
					<div className="button-container">
						{patientOrder.patientOrderDispositionId === PatientOrderDispositionId.OPEN && (
							<Button
								variant="light"
								size="sm"
								onClick={() => {
									setShowCloseEpisodeModal(true);
								}}
							>
								Close Episode
							</Button>
						)}
						{patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED && (
							<>
								<span className="me-3 fw-bold text-gray">Closed</span>
								<Button variant="light" size="sm" onClick={handleReopenButtonClick}>
									Reopen
								</Button>
							</>
						)}
						{patientOrder.patientOrderDispositionId === PatientOrderDispositionId.ARCHIVED && (
							<span className="fw-bold text-gray">Archived</span>
						)}
					</div>
				</Card.Header>
				{(patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED ||
					patientOrder.patientOrderDispositionId === PatientOrderDispositionId.ARCHIVED) && (
					<Card.Body className="bg-n75 border-bottom">
						<Container fluid>
							<Row className="mb-4">
								<Col xs={3}>
									<p className="m-0">Closure Date</p>
								</Col>
								<Col xs={9}>
									<p className="m-0 text-gray">{patientOrder.episodeClosedAtDescription}</p>
								</Col>
							</Row>
							<Row>
								<Col xs={3}>
									<p className="m-0">Closure Reason</p>
								</Col>
								<Col xs={9}>
									<p className="m-0 text-gray">{patientOrder.patientOrderClosureReasonDescription}</p>
								</Col>
							</Row>
						</Container>
					</Card.Body>
				)}
				<Card.Body>
					<Container fluid>
						{patientOrder.patientBelowAgeThreshold && (
							<Row className="mb-4">
								<Col>
									<MhicInlineAlert
										variant="warning"
										title="Patient was under 18 at the time the order was created"
									/>
								</Col>
							</Row>
						)}
						{patientOrder.mostRecentEpisodeClosedWithinDateThreshold && (
							<Row className="mb-4">
								<Col>
									<MhicInlineAlert
										variant="warning"
										title="Order Flagged"
										description="Patient had a recently-closed episode"
									/>
								</Col>
							</Row>
						)}
						{!patientOrder.patientAddressRegionAccepted && (
							<Row className="mb-4">
								<Col>
									<MhicInlineAlert
										variant="warning"
										title="Order Flagged"
										description="Patient does not live in a state supported by the Integrated Care program"
									/>
								</Col>
							</Row>
						)}
						{!patientOrder.primaryPlanAccepted && (
							<Row className="mb-4">
								<Col>
									<MhicInlineAlert
										variant="warning"
										title="Order Flagged"
										description="Insurance plan not accepted"
									/>
								</Col>
							</Row>
						)}
						<Row className="mb-4">
							<Col xs={3}>
								<p className="m-0 text-gray">Date Referred</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">{patientOrder.orderDateDescription}</p>
							</Col>
						</Row>
						<Row className="mb-4">
							<Col xs={3}>
								<p className="m-0 text-gray">Referral Reason</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">{patientOrder.reasonForReferral}</p>
							</Col>
						</Row>
						<hr className="mb-4" />
						<Row className="mb-4">
							<Col xs={3}>
								<p className="m-0 text-gray">Practice</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">
									{patientOrder.referringPracticeName} ({patientOrder.referringPracticeId})
								</p>
							</Col>
						</Row>
						<Row className="mb-4">
							<Col xs={3}>
								<p className="m-0 text-gray">Ordering Provider</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">{patientOrder.orderingProviderDisplayName}</p>
							</Col>
						</Row>
						{/* <Row className="mb-4">
							<Col xs={3}>
								<p className="m-0 text-gray">Authorizing Provider</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">
									<span className="text-danger">[TODO]: Authorizing Provider Name</span>
								</p>
							</Col>
						</Row> */}
						<Row>
							<Col xs={3}>
								<p className="m-0 text-gray">Billing Provider</p>
							</Col>
							<Col xs={9}>
								<p className="m-0">{patientOrder.billingProviderDisplayName}</p>
							</Col>
						</Row>
					</Container>
				</Card.Body>
			</Card>
		</>
	);
};
