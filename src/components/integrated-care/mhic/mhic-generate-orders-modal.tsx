import Cookies from 'js-cookie';
import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import config from '@/lib/config';
import { buildQueryParamUrl } from '@/lib/utils';
import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onSave(): void;
}

export const MhicGenerateOrdersModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const [formValues, setFormValues] = useState({
		count: '',
	});

	const handleOnEnter = useCallback(() => {
		setFormValues({
			count: '',
		});
	}, []);

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (__DEV__) {
				window.location.href = buildQueryParamUrl(
					`${config.COBALT_WEB_API_BASE_URL}/patient-order-csv-generator`,
					{
						orderCount: formValues.count,
						'X-Cobalt-Access-Token': Cookies.get('accessToken'),
					}
				);
			} else {
				window.location.href = buildQueryParamUrl('/ic/patient-order-csv-generator', {
					orderCount: formValues.count,
				});
			}

			onSave();
		},
		[formValues.count, onSave]
	);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Generate Orders</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<Modal.Body>
					<InputHelper
						type="number"
						label="Count"
						value={formValues.count}
						onChange={({ currentTarget }) => {
							setFormValues((previousValue) => ({
								...previousValue,
								count: currentTarget.value,
							}));
						}}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
						Cancel
					</Button>
					<Button type="submit">Generate</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};