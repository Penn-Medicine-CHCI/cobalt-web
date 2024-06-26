import moment from 'moment';
import React, { useMemo } from 'react';
import { Highlighter, Menu, MenuItem, Typeahead } from 'react-bootstrap-typeahead';
import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	input: {
		'& input': {
			textIndent: '16px !important',
		},
	},
	menu: {
		'&.dropdown-menu': {
			border: 0,
			top: '100%  !important',
			transform: 'translate3d(1px, 8px, 0) !important',
			borderRadius: 4,
			inset: 'initial',
			padding: '8px 0',
			boxShadow: theme.elevation.e200,
			backgroundColor: theme.colors.n0,
			'& .dropdown-item': {
				padding: '10px 20px',
				...theme.fonts.default,
				color: theme.colors.n900,
				'&:hover, &:focus, &.active': {
					backgroundColor: theme.colors.n50,
				},
				'&:active': {
					backgroundColor: theme.colors.n75,
				},
				'& mark.rbt-highlight-text': {
					padding: '4px 0',
					borderRadius: 2,
					backgroundColor: theme.colors.p50,
				},
			},
		},
	},
}));

interface TimeInputV2Option {
	title: string;
	value: string;
}

interface Props {
	id: string;
	label: string;
	value: string;
	onChange(value: string): void;
	disabled?: boolean;
	required?: boolean;
	className?: string;
	date?: Date;
}

const timeFormat = 'h:mm A';
const totalSlotsInDay = moment.duration(1, 'day').as('minutes');

const TimeInputV2 = ({ id, label, value, onChange, disabled, required, className, date }: Props) => {
	const classes = useStyles();

	const timeSlots: TimeInputV2Option[] = useMemo(() => {
		const todayDate = new Date();
		const timeSlotOptions = [];
		const startingTimeSlot =
			date && moment(date).isSame(todayDate, 'day')
				? moment(todayDate, timeFormat).startOf('hour')
				: moment(todayDate, timeFormat).set('hour', 9).startOf('hour');

		for (let i = 0; i < totalSlotsInDay; i += 15) {
			startingTimeSlot.add(i === 0 ? 0 : 15, 'minutes');

			const title = startingTimeSlot.format(timeFormat);
			const value = startingTimeSlot.format(timeFormat);

			timeSlotOptions.push({
				title,
				value,
			});
		}

		return timeSlotOptions;
	}, [date]);

	const selectedValue = useMemo(() => {
		const timeSlot = timeSlots.find((ts) => ts.value === value);

		if (timeSlot) {
			return timeSlot;
		}

		return {
			title: value,
			value,
		};
	}, [timeSlots, value]);

	return (
		<Typeahead
			id={id}
			className={className}
			labelKey="title"
			options={timeSlots}
			selected={selectedValue ? [selectedValue] : []}
			onChange={([selected]) => {
				if (!selected) {
					return;
				}

				onChange((selected as TimeInputV2Option).value);
			}}
			onInputChange={onChange}
			disabled={disabled}
			renderInput={({ inputRef, referenceElementRef, value, ...inputProps }) => {
				return (
					<InputHelper
						{...inputProps}
						ref={(input) => {
							inputRef(input);
							referenceElementRef(input);
						}}
						className={classes.input}
						value={value as string}
						label={label}
						required={required}
					/>
				);
			}}
			renderMenu={(
				results,
				{ newSelectionPrefix, paginationText, renderMenuItemChildren, ...menuProps },
				state
			) => (
				<Menu {...menuProps} className={classes.menu}>
					{(results as TimeInputV2Option[]).map((result, index) => (
						<MenuItem key={result.title} option={result} position={index}>
							<Highlighter search={state.text}>{result.title}</Highlighter>
						</MenuItem>
					))}
				</Menu>
			)}
		/>
	);
};

export default TimeInputV2;
