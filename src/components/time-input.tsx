import React, { FC } from 'react';
import InputMask from 'react-input-mask';
import classNames from 'classnames';

import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';

const useMeridianSwitchStyles = createUseThemedStyles((theme) => ({
	meridianToggleWrapper: {
		height: 56,
		flexShrink: 0,
		display: 'flex',
		borderRadius: 50,
		overflow: 'hidden',
		border: `1px solid ${theme.colors.border}`,
	},
	meridianButton: {
		flex: 1,
		border: 'none',
		outline: 'none !important',
		backgroundColor: 'transparent',
		...theme.fonts.small,
		...theme.fonts.bodyBold,
	},
	meridianButtonLeft: {
		padding: '0 15px 0 20px',
	},
	meridianButtonRight: {
		padding: '0 20px 0 15px',
	},
	meridianSelectedButton: {
		color: theme.colors.n0,
		backgroundColor: theme.colors.p500,
	},
}));

type MeridianValue = string | 'am' | 'pm';

interface MeridianSwitchProps {
	testId?: string;
	selected: MeridianValue;
	onChange: (newSelected: MeridianValue) => void;
}

const MeridianSwitch: FC<MeridianSwitchProps> = ({ testId, selected, onChange }) => {
	const classes = useMeridianSwitchStyles();

	return (
		<div className={classes.meridianToggleWrapper}>
			<button
				data-testid={`${testId}AMButton`}
				type="button"
				className={classNames(classes.meridianButton, classes.meridianButtonLeft, {
					[classes.meridianSelectedButton]: selected === 'am',
				})}
				onClick={() => {
					if (selected !== 'am') {
						onChange('am');
					}
				}}
			>
				AM
			</button>
			<button
				data-testid={`${testId}PMButton`}
				type="button"
				className={classNames(classes.meridianButton, classes.meridianButtonRight, {
					[classes.meridianSelectedButton]: selected === 'pm',
				})}
				onClick={() => {
					if (selected !== 'pm') {
						onChange('pm');
					}
				}}
			>
				PM
			</button>
		</div>
	);
};

interface TimeInputProps {
	testId?: string;
	time: string;
	onTimeChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
	meridian: MeridianValue;
	onMeridianChange(meridian: MeridianValue): void;

	label: string;
	name?: string;
	onFocus?: (...args: any[]) => void;
	onBlur?: (...args: any[]) => void;
	helperText?: string;
	error?: string;
	required?: boolean;
	className?: string;
}

const useTimeInputStyles = createUseThemedStyles({
	timeInput: {
		flex: 1,
		marginRight: 8,
	},
});

export const TimeInput = ({
	time,
	onTimeChange,
	meridian,
	onMeridianChange,
	name,
	testId = name,
	className,
	...props
}: TimeInputProps) => {
	const classes = useTimeInputStyles();

	return (
		<div className={classNames('d-flex', className)}>
			<InputHelper
				data-testid={`${testId}Input`}
				className={classes.timeInput}
				as={InputMask}
				//@ts-expect-error InputHelper `as` type forwarding
				mask="99:99"
				maskChar="_"
				value={time}
				name={name}
				onChange={onTimeChange}
				{...props}
			/>
			<MeridianSwitch testId={testId} selected={meridian} onChange={onMeridianChange} />
		</div>
	);
};

export default TimeInput;
