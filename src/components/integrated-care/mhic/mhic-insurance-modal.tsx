import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import InputHelper from '@/components/input-helper';
import DatePicker from '@/components/date-picker';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicInsuranceModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const [coverageEnds, setCoverageEnds] = useState<Date | undefined>(undefined);

	const handleOnEnter = useCallback(() => {
		setCoverageEnds(undefined);
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Insurance</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<InputHelper
					as="select"
					className="mb-4"
					label="Insurance Provider"
					value=""
					onChange={() => {
						return;
					}}
				/>
				<InputHelper
					as="select"
					className="mb-4"
					label="Plan"
					value=""
					onChange={() => {
						return;
					}}
				/>
				<DatePicker
					labelText="Coverage Ends"
					selected={coverageEnds}
					onChange={(date) => {
						if (!date) {
							return;
						}

						setCoverageEnds(date);
					}}
				/>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onSave}>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
