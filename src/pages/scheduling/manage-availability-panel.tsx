import React, { useCallback, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Button } from 'react-bootstrap';

import { LogicalAvailability, SchedulingAppointmentType } from '@/lib/models';
import { schedulingService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncPage from '@/components/async-page';
import { AppointmentTypeFormModal } from './appointment-type-form-modal';
import { AppointmentTypeItem } from './appointment-type-item';
import colors from '@/jss/colors';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';

const useStyles = createUseStyles({
	roundBtn: {
		width: 36,
		height: 36,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 100,
		border: `2px solid ${colors.primary}`,
		backgroundColor: 'transparent',
		'& path': {
			fill: colors.primary,
		},
	},
});

interface ManageAvailabilityPanelProps {
	onClose: () => void;
	onEditAvailability: (logicalAvailabilityId?: string) => void;
	onEditTimeBlock: (logicalAvailabilityId?: string) => void;
}

export const ManageAvailabilityPanel = ({
	onEditAvailability,
	onEditTimeBlock,
	onClose,
}: ManageAvailabilityPanelProps) => {
	const classes = useStyles();
	const { account } = useAccount();

	const [appointmentTypes, setAppointmentTypes] = useState<SchedulingAppointmentType[]>([]);
	const [regularHours, setRegularHours] = useState<LogicalAvailability[]>([]);
	const [unavailableTimeBlocks, setUnavailableTimeBlocks] = useState<LogicalAvailability[]>([]);

	const [appointmentTypeIdToEdit, setAppointmentTypeIdToEdit] = useState<string>();
	const [appointmentTypeModalOpen, setAppointmentTypeModalOpen] = useState(false);

	const fetchData = useCallback(async () => {
		if (!account || !account.providerId) {
			throw new Error('account.providerId is undefined');
		}

		const [appointmentTypesResponse, regularHoursResponse, unavailableTimeResponse] = await Promise.all([
			schedulingService.getAppointmentTypes(account.providerId).fetch(),
			schedulingService.getRegularHours(account.providerId).fetch(),
			schedulingService.getUnavailableTime(account.providerId).fetch(),
		]);

		setAppointmentTypes(appointmentTypesResponse.appointmentTypes);
		setRegularHours(regularHoursResponse.logicalAvailabilities);
		setUnavailableTimeBlocks(unavailableTimeResponse.logicalAvailabilities);
	}, [account]);

	return (
		<>
			<AppointmentTypeFormModal
				appointmentTypeId={appointmentTypeIdToEdit}
				show={appointmentTypeModalOpen}
				onHide={() => {
					setAppointmentTypeIdToEdit(undefined);
					setAppointmentTypeModalOpen(false);
				}}
				onSave={() => {
					fetchData();
					setAppointmentTypeModalOpen(false);
				}}
				onDelete={() => {
					fetchData();
					setAppointmentTypeModalOpen(false);
				}}
			/>

			<div className="py-4">
				<div className="mb-7 d-flex align-items-center justify-content-between">
					<h3>Manage availability</h3>
					<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
						<CloseIcon />
					</Button>
				</div>

				<AsyncPage fetchData={fetchData}>
					<div className="mb-1 d-flex align-items-center justify-content-between">
						<h5>appointment types</h5>
						<button className={classes.roundBtn} onClick={() => setAppointmentTypeModalOpen(true)}>
							<PlusIcon />
						</button>
					</div>
					<div className="mb-5">
						{appointmentTypes.map((appointmentType) => {
							return (
								<AppointmentTypeItem
									key={appointmentType.appointmentTypeId}
									color={appointmentType.hexColor}
									nickname={appointmentType.name}
									onEdit={() => {
										setAppointmentTypeIdToEdit(appointmentType.appointmentTypeId);
										setAppointmentTypeModalOpen(true);
									}}
								/>
							);
						})}
					</div>

					<div className="mb-1 d-flex align-items-center justify-content-between">
						<h5>regular hours</h5>
						<button className={classes.roundBtn} onClick={() => onEditAvailability()}>
							<PlusIcon />
						</button>
					</div>
					<div className="mb-5">
						{regularHours.map((logicalAvailability) => {
							return (
								<LogicalAvailabilityItem
									key={logicalAvailability.logicalAvailabilityId}
									logicalAvailability={logicalAvailability}
									onEdit={onEditAvailability}
								/>
							);
						})}
					</div>

					<div className="mb-1 d-flex align-items-center justify-content-between">
						<h5>unavailable time block</h5>
						<button className={classes.roundBtn} onClick={() => onEditTimeBlock()}>
							<PlusIcon />
						</button>
					</div>
					<div>
						{unavailableTimeBlocks.map((logicalAvailability) => {
							return (
								<LogicalAvailabilityItem
									key={logicalAvailability.logicalAvailabilityId}
									logicalAvailability={logicalAvailability}
									onEdit={onEditTimeBlock}
								/>
							);
						})}
					</div>
				</AsyncPage>
			</div>
		</>
	);
};

interface LogicalAvailabilityItemProps {
	logicalAvailability: LogicalAvailability;
	onEdit: (availabilityId: string) => void;
}

const LogicalAvailabilityItem = ({ logicalAvailability, onEdit }: LogicalAvailabilityItemProps) => {
	return (
		<div key={logicalAvailability.logicalAvailabilityId} className="mb-2 border py-2 px-3">
			<div className="d-flex align-items-center justify-content-between">
				<div>
					{logicalAvailability.descriptionComponents?.map((description, index) => {
						return (
							<p key={index} className="m-0 font-karla-bold">
								{description}
							</p>
						);
					})}
				</div>
				<Button
					variant="link"
					size="sm"
					className="p-0"
					onClick={() => {
						onEdit(logicalAvailability.logicalAvailabilityId);
					}}
				>
					<EditIcon height={24} width={24} />
				</Button>
			</div>
			{logicalAvailability.appointmentTypes.map((appointmentType) => {
				return (
					<AppointmentTypeItem
						key={appointmentType.appointmentTypeId}
						color={appointmentType.hexColor}
						nickname={appointmentType.name}
					/>
				);
			})}
		</div>
	);
};
