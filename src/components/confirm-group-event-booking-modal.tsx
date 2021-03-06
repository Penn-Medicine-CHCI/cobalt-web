import React, { FC, useCallback, useEffect } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useConfirmGroupEventBookingModalStyles = createUseStyles({
	confirmGroupEventBookingModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface ConfirmGroupEventBookingModalProps extends ModalProps {
	onConfirm(): void;
	groupEventName: string;
	dateTime: string;
	externalUrl?: string;
}

const ConfirmGroupEventBookingModal: FC<ConfirmGroupEventBookingModalProps> = ({ onConfirm, groupEventName, dateTime, externalUrl, ...modalProps }) => {
	const classes = useConfirmGroupEventBookingModalStyles();

	const navigateToExternalUrl = useCallback(() => {
		if (!externalUrl) {
			return;
		}

		const url = externalUrl?.startsWith('http') ? externalUrl : `https://${externalUrl}`;

		window.open(url, '_self');
	}, [externalUrl]);

	useEffect(() => {
		if (modalProps.show) {
			const timeoutId = setTimeout(() => {
				navigateToExternalUrl();
			}, 3000);

			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [modalProps.show, navigateToExternalUrl]);

	return (
		<Modal {...modalProps} dialogClassName={classes.confirmGroupEventBookingModal} centered>
			<Modal.Header>
				<h3 className="mb-0">confirm reservation</h3>
			</Modal.Header>
			<Modal.Body>
				{!!externalUrl ? (
					<p>This session is managed outside of Cobalt. Please wait a moment while we take you to the site where you can complete your booking.</p>
				) : (
					<>
						<p className="mb-0 font-karla-bold">in the studio event</p>
						<p className="mb-2">{groupEventName}</p>

						<p className="mb-0 font-karla-bold">scheduled for</p>
						<p className="mb-0">{dateTime}?</p>
					</>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-primary" size="sm" onClick={modalProps.onHide}>
					cancel
				</Button>
				<Button
					variant="primary"
					size="sm"
					onClick={() => {
						if (externalUrl) {
							navigateToExternalUrl();
						} else {
							onConfirm();
						}
					}}
				>
					{externalUrl ? 'ok' : 'reserve'}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmGroupEventBookingModal;
