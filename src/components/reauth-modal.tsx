import Cookies from 'js-cookie';
import React, { FC, useCallback, useContext } from 'react';
import { useHistory, useLocation } from 'react-router';
import { ModalProps, Modal, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { ReauthModalContext } from '@/contexts/reauth-modal-context';

const usStyles = createUseStyles({
	modal: {
		width: '90%',
		maxWidth: 400,
		margin: '0 auto',
	},
});

const ReauthModal: FC<ModalProps> = ({ ...props }) => {
	const classes = usStyles();
	const history = useHistory();
	const location = useLocation();
	const { showReauthModal, setShowReauthModal, signOnUrl } = useContext(ReauthModalContext);

	const handleOnEnter = useCallback(() => {
		const authRedirectUrl = location.pathname + (location.search || '');
		Cookies.set('authRedirectUrl', authRedirectUrl);
	}, [location.pathname, location.search]);

	return (
		<Modal
			show={showReauthModal}
			dialogClassName={classes.modal}
			centered
			{...props}
			onHide={() => {
				history.goBack();
				setShowReauthModal(false);
			}}
			onEnter={handleOnEnter}
		>
			<Modal.Header closeButton>
				<Modal.Title>Reauthentication Required</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-3">This page contains information that requires reauthentication.</p>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button
						type="button"
						variant="outline-primary"
						onClick={() => {
							history.goBack();
							setShowReauthModal(false);
						}}
					>
						cancel
					</Button>
					<Button
						className="ms-2"
						type="submit"
						variant="primary"
						onClick={() => {
							window.location.href = signOnUrl;
						}}
					>
						proceed
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ReauthModal;
