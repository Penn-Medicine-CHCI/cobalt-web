import React, { FC, forwardRef } from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';

import unfoldIcon from '@/assets/icons/icon-unfold.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useDatePickerStyles = createUseThemedStyles((theme) => ({
	datePickerWrapper: {
		width: '100%',
	},
	datePicker: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		height: 56,
		lineHeight: '4.2rem',
		textIndent: 0,
		paddingLeft: 15,
		paddingRight: 15,
		border: `1px solid ${theme.colors.border}`,
		backgroundColor: theme.colors.white,
		textAlign: 'left',
		'&:disabled': {
			backgroundColor: theme.colors.background,
		},
	},
}));

interface DatePickerProps extends ReactDatePickerProps {
	selected?: Date;
	disabled?: boolean;
	onChange: (value: Date | null) => void;
	wrapperClass?: string;
	labelText?: string;
}

const CustomDateInput = forwardRef(({ value, onClick, disabled, className, label }: any, ref: any) => {
	return (
		<button type="button" ref={ref} className={className} onClick={onClick} disabled={disabled}>
			{value || label || 'Select Date'}
			<img className="ml-auto" src={unfoldIcon} alt="unfold date picker" />
		</button>
	);
});

const DatePicker: FC<DatePickerProps> = ({ selected, onChange, wrapperClass, labelText, ...reactDatePickerProps }) => {
	const classes = useDatePickerStyles();

	return (
		<ReactDatePicker
			wrapperClassName={`${classes.datePickerWrapper} ${wrapperClass}`}
			dateFormat="MMM d, yyyy"
			selected={selected}
			onChange={onChange}
			customInput={
				<CustomDateInput
					className={classes.datePicker}
					label={labelText}
					disabled={reactDatePickerProps.disabled}
				/>
			}
			{...reactDatePickerProps}
		/>
	);
};

export default DatePicker;
