import { cloneDeep } from 'lodash';
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Col, Container, Form, Row } from 'react-bootstrap';

import { PatientOrderModel } from '@/lib/models';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';

import { ReactComponent as FlagIcon } from '@/assets/icons/icon-flag.svg';

interface MhicPatientOrderTableProps {
	isLoading: boolean;
	patientOrders: PatientOrderModel[];
	selectAll: boolean;
	onSelectAllChange(value: boolean): void;
	selectedPatientOrderIds: string[];
	onSelectPatientOrderIdsChange(selectedPatientOrderIds: string[]): void;
	totalPatientOrdersCount: number;
	totalPatientOrdersDescription: string;
	pageNumber: number;
	pageSize: number;
	onPaginationClick(pageIndex: number): void;
	columnConfig: {
		checkbox?: boolean;
		flag?: boolean;
		patient?: boolean;
		referralDate?: boolean;
		practice?: boolean;
		referralReason?: boolean;
		assessmentStatus?: boolean;
		outreachNumber?: boolean;
		lastOutreach?: boolean;
		assessmentScheduled?: boolean;
		assessmentCompleted?: boolean;
		completedBy?: boolean;
		triage?: boolean;
		resources?: boolean;
		checkInScheduled?: boolean;
		checkInResponse?: boolean;
		episode?: boolean;
		assignedMhic?: boolean;
	};
}

export const MhicPatientOrderTable = ({
	isLoading,
	patientOrders,
	selectAll,
	onSelectAllChange,
	selectedPatientOrderIds,
	onSelectPatientOrderIdsChange,
	totalPatientOrdersCount,
	totalPatientOrdersDescription,
	pageNumber,
	pageSize,
	onPaginationClick,
	columnConfig,
}: MhicPatientOrderTableProps) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const patientColumnOffset = useMemo(() => {
		if (columnConfig.checkbox && columnConfig.flag) {
			return 100;
		} else if (columnConfig.checkbox) {
			return 56;
		} else if (columnConfig.flag) {
			return 44;
		}

		return 0;
	}, [columnConfig.checkbox, columnConfig.flag]);

	return (
		<>
			<div className="mb-8">
				<Table isLoading={isLoading}>
					<TableHead>
						<TableRow>
							{columnConfig.checkbox && (
								<TableCell header width={56} sticky className="ps-6 pe-0 align-items-start">
									<Form.Check
										className="no-label"
										type="checkbox"
										name="orders"
										id="orders--select-all"
										label=""
										value="SELECT_ALL"
										checked={selectAll}
										onChange={({ currentTarget }) => {
											if (currentTarget.checked) {
												const allPatientOrderIds = cloneDeep(patientOrders).map(
													(order) => order.patientOrderId
												);

												onSelectPatientOrderIdsChange(allPatientOrderIds);
											} else {
												onSelectPatientOrderIdsChange([]);
											}

											onSelectAllChange(currentTarget.checked);
										}}
									/>
								</TableCell>
							)}
							{columnConfig.flag && (
								<TableCell
									header
									width={44}
									stickyOffset={columnConfig.checkbox ? 56 : 0}
									sticky
									className="align-items-center"
								></TableCell>
							)}
							{columnConfig.patient && (
								<TableCell header width={280} sticky stickyOffset={patientColumnOffset} stickyBorder>
									Patient
								</TableCell>
							)}
							{columnConfig.referralDate && <TableCell header>Referral Date</TableCell>}
							{columnConfig.practice && <TableCell header>Practice</TableCell>}
							{columnConfig.referralReason && <TableCell header>Referral Reason</TableCell>}
							{columnConfig.assessmentStatus && <TableCell header>Assessment Status</TableCell>}
							{columnConfig.outreachNumber && (
								<TableCell header className="text-right">
									Outreach #
								</TableCell>
							)}
							{columnConfig.lastOutreach && <TableCell header>Last Outreach</TableCell>}
							{columnConfig.assessmentScheduled && <TableCell header>Assess. Scheduled</TableCell>}
							{columnConfig.assessmentCompleted && <TableCell header>Assess. Completed</TableCell>}
							{columnConfig.completedBy && <TableCell header>Completed By</TableCell>}
							{columnConfig.triage && <TableCell header>Triage</TableCell>}
							{columnConfig.resources && <TableCell header>Resources?</TableCell>}
							{columnConfig.checkInScheduled && <TableCell header>Check-In Scheduled</TableCell>}
							{columnConfig.checkInResponse && <TableCell header>Check-In Response</TableCell>}
							{columnConfig.episode && (
								<TableCell header className="text-right">
									Episode
								</TableCell>
							)}
							{columnConfig.assignedMhic && <TableCell header>Assigned MHIC</TableCell>}
						</TableRow>
					</TableHead>
					<TableBody>
						{patientOrders.map((po) => {
							return (
								<TableRow
									key={po.patientOrderId}
									onClick={() => {
										if (!po.patientOrderId) {
											return;
										}

										searchParams.set('openPatientOrderId', po.patientOrderId);
										setSearchParams(searchParams);
									}}
									highlighted={selectedPatientOrderIds.includes(po.patientOrderId)}
								>
									{columnConfig.checkbox && (
										<TableCell header width={56} sticky className="ps-6 pe-0 align-items-start">
											<Form.Check
												className="no-label"
												type="checkbox"
												name="orders"
												id={`orders--${po.patientOrderId}`}
												label=""
												value={po.patientOrderId}
												checked={selectedPatientOrderIds.includes(po.patientOrderId)}
												onClick={(event) => {
													event.stopPropagation();
												}}
												onChange={({ currentTarget }) => {
													const selectedPatientOrderIdsClone =
														cloneDeep(selectedPatientOrderIds);

													const targetIndex = selectedPatientOrderIdsClone.findIndex(
														(orderId) => orderId === currentTarget.value
													);

													if (targetIndex > -1) {
														selectedPatientOrderIdsClone.splice(targetIndex, 1);
													} else {
														selectedPatientOrderIdsClone.push(currentTarget.value);
													}

													const allAreSelected = patientOrders.every((order) =>
														selectedPatientOrderIdsClone.includes(order.patientOrderId)
													);

													if (allAreSelected) {
														onSelectAllChange(true);
													} else {
														onSelectAllChange(false);
													}

													onSelectPatientOrderIdsChange(selectedPatientOrderIdsClone);
												}}
											/>
										</TableCell>
									)}
									{columnConfig.flag && (
										<TableCell
											width={44}
											sticky
											stickyOffset={columnConfig.checkbox ? 56 : 0}
											className="px-0 flex-row align-items-center justify-content-end"
										>
											<span className="text-gray">0</span>
											<FlagIcon className="text-warning" />
										</TableCell>
									)}
									{columnConfig.patient && (
										<TableCell
											width={280}
											sticky
											stickyOffset={patientColumnOffset}
											stickyBorder
											className="py-2"
										>
											<span className="d-block text-nowrap">{po.patientDisplayName}</span>
											<span className="d-block text-nowrap text-gray">{po.patientMrn}</span>
										</TableCell>
									)}
									{columnConfig.referralDate && (
										<TableCell width={144}>
											<span className="text-nowrap text-truncate">{po.orderDateDescription}</span>
										</TableCell>
									)}
									{columnConfig.practice && (
										<TableCell width={240}>
											<span className="text-nowrap text-truncate">
												{po.referringPracticeName}
											</span>
										</TableCell>
									)}
									{columnConfig.referralReason && (
										<TableCell width={320}>
											<span className="text-nowrap text-truncate">{po.reasonForReferral}</span>
										</TableCell>
									)}
									{columnConfig.assessmentStatus && (
										<TableCell
											width={248}
											className="flex-row align-items-center justify-content-start"
										>
											<Badge pill bg="outline-dark" className="text-nowrap">
												Assessment Status
											</Badge>
											<span className="ms-4 fs-small">Insurance</span>
										</TableCell>
									)}
									{columnConfig.outreachNumber && (
										<TableCell width={116} className="text-right">
											<span className="text-nowrap text-truncate">0</span>
										</TableCell>
									)}
									{columnConfig.lastOutreach && (
										<TableCell width={170}>
											<span className="text-nowrap text-truncate">Jan 30, 2023</span>
										</TableCell>
									)}
									{columnConfig.assessmentScheduled && (
										<TableCell width={170}>
											<span className="text-nowrap text-truncate">Jan 30, 2023</span>
										</TableCell>
									)}
									{columnConfig.assessmentCompleted && (
										<TableCell width={170}>
											<span className="text-nowrap text-truncate">Jan 30, 2023</span>
										</TableCell>
									)}
									{columnConfig.completedBy && (
										<TableCell width={240}>
											<span className="text-nowrap text-truncate">Mhic Name</span>
										</TableCell>
									)}
									{columnConfig.triage && (
										<TableCell className="flex-row align-items-center justify-content-start">
											<Badge pill bg="outline-danger" className="text-nowrap me-2">
												Safety Planning
											</Badge>
											<Badge pill bg="outline-warning" className="text-nowrap">
												Specialty
											</Badge>
										</TableCell>
									)}
									{columnConfig.resources && (
										<TableCell className="flex-row align-items-center justify-content-start">
											<Badge pill bg="outline-danger" className="text-nowrap me-2">
												Need
											</Badge>
										</TableCell>
									)}
									{columnConfig.checkInScheduled && (
										<TableCell width={180}>
											<span className="text-nowrap text-truncate">Jan 30, 2023</span>
										</TableCell>
									)}
									{columnConfig.checkInResponse && (
										<TableCell width={172}>
											<span className="text-nowrap text-truncate">No Response</span>
										</TableCell>
									)}
									{columnConfig.episode && (
										<TableCell width={120} className="text-right">
											<span className="text-nowrap text-truncate">
												{po.episodeDurationInDaysDescription}
											</span>
										</TableCell>
									)}
									{columnConfig.assignedMhic && (
										<TableCell width={280}>
											<span className="text-nowrap text-truncate">MHIC Name</span>
										</TableCell>
									)}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
			<div className="pb-20">
				<Container fluid>
					<Row>
						<Col xs={{ span: 4, offset: 4 }}>
							<div className="d-flex justify-content-center align-items-center">
								<TablePagination
									total={totalPatientOrdersCount}
									page={pageNumber}
									size={pageSize}
									onClick={onPaginationClick}
								/>
							</div>
						</Col>
						<Col xs={4}>
							<div className="d-flex justify-content-end align-items-center">
								<p className="mb-0 fs-large fw-bold text-gray">
									<span className="text-dark">{patientOrders.length}</span> of{' '}
									<span className="text-dark">{totalPatientOrdersDescription}</span> Patients
								</p>
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		</>
	);
};