import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import colors from '@/jss/colors';
import fonts from '@/jss/fonts';

const useCovidCopayModalStyles = createUseStyles({
	covidCopayModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
		'& .modal-content': {
			display: 'flex',
			justifyContent: 'center',
			height: 295,
			width: 295,
			borderRadius: '50%',
			backgroundColor: colors.success,
		},
	},
	subTitle: {
		...fonts.xxxs,
	},
});

interface CovidCopayModalProps extends ModalProps {}

const CovidCopayModal: FC<CovidCopayModalProps> = ({ ...props }) => {
	const classes = useCovidCopayModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.covidCopayModal} centered>
			<Modal.Header>
				<p className={classNames('text-center text-white text-uppercase', classes.subTitle)}>
					In light of covid-19
				</p>
				<h3 className="mb-0 text-center text-white">your co-pays are being waived</h3>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-2 font-karla-regular text-center text-white">
					please use our services as much as you need during this challenging time
				</p>
			</Modal.Body>

			<Modal.Footer className="justify-content-center">
				<Button variant="light" size="sm" onClick={props.onHide}>
					okay
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default CovidCopayModal;
