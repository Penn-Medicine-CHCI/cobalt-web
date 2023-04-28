import moment from 'moment';
import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import DatePicker from '@/components/date-picker';
import TimeInputV2 from '@/components/time-input-v2';
import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	patientOrder: PatientOrderModel;
	onSave(patientOrder: PatientOrderModel): void;
}

export const MhicScheduleAssessmentModal: FC<Props> = ({ patientOrder, onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [formValues, setFormValues] = useState({
		date: undefined as Date | undefined,
		time: '',
		link: '',
	});
	const [isSaving, setIsSaving] = useState(false);

	const handleOnEnter = useCallback(() => {
		setFormValues({
			date: undefined,
			time: '',
			link: '',
		});
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSaving(true);

				await integratedCareService
					.scheduleAssessment({
						scheduledDate: moment(formValues.date).format('YYYY-MM-DD'),
						scheduledTime: formValues.time,
						patientOrderId: patientOrder.patientOrderId,
						calendarUrl: formValues.link,
					})
					.fetch();
				const response = await integratedCareService.getPatientOrder(patientOrder.patientOrderId).fetch();

				onSave(response.patientOrder);
			} catch (error) {
				handleError(error);
			} finally {
				setIsSaving(false);
			}
		},
		[formValues.date, formValues.link, formValues.time, handleError, onSave, patientOrder]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>
					{patientOrder.patientOrderScheduledScreeningId
						? 'Edit Assessment Appointment'
						: 'Schedule Assessment'}
				</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<DatePicker
						className="mb-4"
						labelText="Date"
						selected={formValues.date}
						onChange={(date) => {
							setFormValues((previousValues) => ({
								...previousValues,
								date: date ?? undefined,
							}));
						}}
						disabled={isSaving}
					/>
					<TimeInputV2
						id="schedule-assessment__time-input"
						className="mb-4"
						label="Assessment Time"
						value={formValues.time}
						onChange={(time) => {
							setFormValues((previousValues) => ({
								...previousValues,
								time,
							}));
						}}
						disabled={isSaving}
					/>
					<InputHelper
						type="text"
						label="Outlook Calendar Link"
						value={formValues.link}
						onChange={({ currentTarget }) => {
							setFormValues((previousValues) => ({
								...previousValues,
								link: currentTarget.value,
							}));
						}}
						disabled={isSaving}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isSaving}>
						Cancel
					</Button>
					<Button variant="primary" type="submit" disabled={isSaving}>
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
