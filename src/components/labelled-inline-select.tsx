import React, { FC } from 'react';
import { Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import colors from '@/jss/colors';
import fonts from '@/jss/fonts';

import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';

const useLabelledInlineSelectStyles = createUseStyles({
	wrapper: {
		display: 'flex',
		alignItems: 'center',
		position: 'relative',
		justifyContent: 'space-between',
		'& label': {
			...fonts.m,
			marginBottom: 0,
		},
		'& select': {
			...fonts.l,
			border: 'none',
			borderRadius: 0,
			cursor: 'pointer',
			appearance: 'none',
			marginLeft: 'auto',
			color: colors.primary,
			...fonts.nunitoSansBold,
			padding: '0 16px 0 0',
			backgroundColor: 'transparent',
			borderBottom: `1px solid ${colors.primary}`,
			'&:focus': {
				outline: 'none',
			},
			'&::-ms-expand': {
				display: 'none',
			},
			textTransform: 'lowercase',
		},
	},
	downChevron: {
		right: 0,
		top: '50%',
		position: 'absolute',
		fill: colors.primary,
		transform: 'translateY(-50%)',
	},
});

interface LabelledInlineSelectProps {
	id: string;
	value: string;
	onChange(event: React.ChangeEvent<HTMLSelectElement>): void;
}

const LabelledInlineSelect: FC<LabelledInlineSelectProps> = (props) => {
	const classes = useLabelledInlineSelectStyles();

	function handleOnChange(event: React.ChangeEvent<HTMLSelectElement>) {
		props.onChange(event);
	}

	return (
		<div className={classes.wrapper}>
			<Form.Label htmlFor={props.id}>type of support</Form.Label>
			<Form.Control id={props.id} as="select" dir="rtl" value={props.value} onChange={handleOnChange}>
				{props.children}
			</Form.Control>
			<DownChevron className={classes.downChevron} />
		</div>
	);
};

export default LabelledInlineSelect;
