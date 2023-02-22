import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { PatientOrderModel, PatientOrderOutreachModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import {
	MhicAssessmentModal,
	MhicComment,
	MhicOutreachModal,
	MhicScheduleAssessmentModal,
} from '@/components/integrated-care/mhic';
import NoData from '@/components/no-data';
import { ReactComponent as FlagDanger } from '@/assets/icons/flag-danger.svg';

interface Props {
	patientOrder: PatientOrderModel;
	onPatientOrderChange(patientOrder: PatientOrderModel): void;
}

export const MhicOutreachAndAssesment = ({ patientOrder, onPatientOrderChange }: Props) => {
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [showOutreachModal, setShowOutreachModal] = useState(false);
	const [outreachToEdit, setOutreachToEdit] = useState<PatientOrderOutreachModel>();
	const [assessmentIdToEdit, setAssessmentIdToEdit] = useState('');
	const [showScheduleAssessmentModal, setShowScheduleAssessmentModal] = useState(false);
	const [showAssessmentModal, setShowAssessmentModal] = useState(false);

	const handleOutreachModalSave = useCallback(
		async (_patientOrderOutreach: PatientOrderOutreachModel, isEdit: boolean) => {
			try {
				if (!patientOrder.patientOrderId) {
					throw new Error('patientOrder.patientOrderId is undefined.');
				}

				const patientOverviewResponse = await integratedCareService
					.getPatientOrder(patientOrder.patientOrderId)
					.fetch();

				onPatientOrderChange(patientOverviewResponse.patientOrder);
				addFlag({
					variant: 'success',
					title: isEdit ? 'Outreach updated' : 'Outreach added',
					description: '{Message}',
					actions: [],
				});

				setOutreachToEdit(undefined);
				setShowOutreachModal(false);
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, onPatientOrderChange, patientOrder.patientOrderId]
	);

	return (
		<>
			<MhicOutreachModal
				patientOrderId={patientOrder.patientOrderId}
				outreachToEdit={outreachToEdit}
				show={showOutreachModal}
				onHide={() => {
					setShowOutreachModal(false);
				}}
				onSave={handleOutreachModalSave}
			/>

			<MhicScheduleAssessmentModal
				assessmentId={assessmentIdToEdit}
				show={showScheduleAssessmentModal}
				onHide={() => {
					setShowScheduleAssessmentModal(false);
				}}
				onSave={() => {
					setShowScheduleAssessmentModal(false);
				}}
			/>

			<MhicAssessmentModal
				show={showAssessmentModal}
				onHide={() => {
					setShowAssessmentModal(false);
				}}
			/>

			<section>
				<Container fluid className="overflow-visible">
					<Row className="mb-6">
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">
									Outreach Attempts{' '}
									<span className="text-gray">
										({(patientOrder.patientOrderOutreaches ?? []).length})
									</span>
								</h4>
								<Button
									onClick={() => {
										setOutreachToEdit(undefined);
										setShowOutreachModal(true);
									}}
								>
									Add Outreach Attempt
								</Button>
							</div>
						</Col>
					</Row>
					<Row>
						<Col>
							{(patientOrder.patientOrderOutreaches ?? []).map((outreach, outreachIndex) => {
								const isLast = outreachIndex === (patientOrder.patientOrderOutreaches ?? []).length - 1;
								return (
									<MhicComment
										key={outreach.patientOrderOutreachId}
										className={classNames({ 'mb-4': !isLast })}
										name={outreach.account.displayName ?? ''}
										date={outreach.outreachDateTimeDescription}
										message={outreach.note}
										onEdit={() => {
											setOutreachToEdit(outreach);
											setShowOutreachModal(true);
										}}
										onDelete={() => {
											// handleDeleteComment(note.patientOrderNoteId);
										}}
									/>
								);
							})}
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row className="mb-6">
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">Latest Assessment</h4>
								<Button
									onClick={() => {
										window.alert('[TODO]: Link to start assessment?');
									}}
								>
									Start Assessment
								</Button>
							</div>
						</Col>
					</Row>
					<Row>
						<Col>
							<NoData
								className="mb-6"
								title="No Assessment"
								description="There is no assessment for the patient's most recent referral order"
								actions={[
									{
										variant: 'outline-primary',
										title: 'Schedule Assessment',
										onClick: () => {
											setAssessmentIdToEdit('');
											setShowScheduleAssessmentModal(true);
										},
									},
								]}
							/>
							<NoData
								className="bg-white"
								title="Assessment is Scheduled"
								description="Nov 12, 2023 at 2:30 PM"
								actions={[
									{
										variant: 'primary',
										title: 'View Appointment',
										onClick: () => {
											window.alert('[TODO]: Link to appointment details?');
										},
									},
									{
										variant: 'outline-primary',
										title: 'Edit Appointment Date',
										onClick: () => {
											setAssessmentIdToEdit('xxx');
											setShowScheduleAssessmentModal(true);
										},
									},
								]}
							/>
						</Col>
					</Row>
				</Container>
			</section>
			<section>
				<Container fluid>
					<Row className="mb-5">
						<Col>
							<h4 className="mb-0">
								Past Assessments <span className="text-gray">(1)</span>
							</h4>
						</Col>
					</Row>
					<Row>
						<Col>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell header>
											<span>Sep 21, 2022 at 12:30AM</span>
											<span className="fw-normal">Completed By: Patient</span>
										</TableCell>
										<TableCell header colSpan={4} className="text-right justify-content-end">
											<span>Triage: Specialty Care</span>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow>
										<TableCell>
											<span className="fw-semibold">C-SSRS</span>
										</TableCell>
										<TableCell width={32} className="px-0"></TableCell>
										<TableCell width={72} className="pe-0">
											<span className="text-gray">Score:</span>
										</TableCell>
										<TableCell width={32} className="px-0 text-right">
											<span className="fw-bold">4</span>
										</TableCell>
										<TableCell width={84} className="text-center">
											<Button
												variant="link"
												size="sm"
												className="p-0 text-decoration-none fw-normal"
												onClick={() => {
													setShowAssessmentModal(true);
												}}
											>
												View
											</Button>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>
											<span className="fw-semibold">GAD-7</span>
										</TableCell>
										<TableCell width={32} className="px-0"></TableCell>
										<TableCell width={72} className="pe-0">
											<span className="text-gray">Score:</span>
										</TableCell>
										<TableCell width={32} className="px-0 text-right">
											<span className="fw-bold">12</span>
										</TableCell>
										<TableCell width={84} className="text-center">
											<Button
												variant="link"
												size="sm"
												className="p-0 text-decoration-none fw-normal"
												onClick={() => {
													setShowAssessmentModal(true);
												}}
											>
												View
											</Button>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>
											<span className="fw-semibold">PHQ-9</span>
										</TableCell>
										<TableCell width={32} className="px-0">
											<FlagDanger className="text-danger" />
										</TableCell>
										<TableCell width={72} className="pe-0">
											<span className="text-gray">Score:</span>
										</TableCell>
										<TableCell width={32} className="px-0 text-right">
											<span className="fw-bold">13</span>
										</TableCell>
										<TableCell width={84} className="text-center">
											<Button
												variant="link"
												size="sm"
												className="p-0 text-decoration-none fw-normal"
												onClick={() => {
													setShowAssessmentModal(true);
												}}
											>
												View
											</Button>
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</Col>
					</Row>
				</Container>
			</section>
		</>
	);
};
