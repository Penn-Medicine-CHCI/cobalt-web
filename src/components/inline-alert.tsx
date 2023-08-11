import React, { ReactNode, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';
import { ReactComponent as SuccessIcon } from '@/assets/icons/flag-success.svg';
import { ReactComponent as WarningIcon } from '@/assets/icons/flag-warning.svg';
import { ReactComponent as DangerIcon } from '@/assets/icons/icon-flag.svg';

const useStyles = createUseThemedStyles((theme) => ({
	inlineAlert: {
		padding: 16,
		display: 'flex',
		borderRadius: 4,
		backgroundColor: theme.colors.n50,
		border: `1px solid ${theme.colors.n100}`,
		'&--primary': {
			backgroundColor: theme.colors.p50,
			borderColor: theme.colors.p500,
			'& svg': {
				color: theme.colors.p500,
			},
		},
		'&--secondary': {
			backgroundColor: theme.colors.a50,
			borderColor: theme.colors.a500,
			'& svg': {
				color: theme.colors.a500,
			},
		},
		'&--success': {
			backgroundColor: theme.colors.s50,
			borderColor: theme.colors.s500,
			'& svg': {
				color: theme.colors.s500,
			},
		},
		'&--warning': {
			backgroundColor: theme.colors.w50,
			borderColor: theme.colors.w500,
			'& svg': {
				color: theme.colors.w500,
			},
		},
		'&--danger': {
			backgroundColor: theme.colors.d50,
			borderColor: theme.colors.d500,
			'& svg': {
				color: theme.colors.d500,
			},
		},
	},
	iconOuter: {
		width: 24,
		flexShrink: 0,
		marginRight: 16,
	},
	informationOuter: {
		flex: 1,
	},
}));

interface InlineAlertAction {
	title: string;
	onClick(): void;
	disabled?: boolean;
}

interface InlineAlertProps {
	variant?: 'primary' | 'success' | 'warning' | 'danger';
	title: string;
	description?: string;
	action?: InlineAlertAction | InlineAlertAction[];
	className?: string;
}

export const InlineAlert = ({ title, description, action, variant = 'primary', className }: InlineAlertProps) => {
	const classes = useStyles({});

	const icon: Record<Exclude<typeof variant, undefined>, ReactNode> = useMemo(() => {
		return {
			primary: <InfoIcon width={24} height={24} />,
			success: <SuccessIcon width={24} height={24} />,
			warning: <WarningIcon width={24} height={24} />,
			danger: <DangerIcon width={24} height={24} />,
		};
	}, []);

	const actionsToRender = useMemo(() => {
		if (!action) {
			return [];
		} else if (Array.isArray(action)) {
			return action;
		} else {
			return [action];
		}
	}, [action]);

	return (
		<div
			className={classNames(
				classes.inlineAlert,
				{
					[`${classes.inlineAlert}--${variant}`]: !!variant,
				},
				className
			)}
		>
			<div className={classes.iconOuter}>{variant && icon[variant]}</div>
			<div className={classes.informationOuter}>
				<p
					className={classNames('fs-large fw-bold', {
						'mb-0': !description && !action,
						'mb-2': description || action,
					})}
				>
					{title}
				</p>
				{description && (
					<p
						className={classNames({
							'mb-2': !!action === true,
							'mb-0': !!action === false,
						})}
					>
						{description}
					</p>
				)}
				{actionsToRender.length > 0 && (
					<div>
						{actionsToRender.map((a, actionIndex) => {
							const isLast = actionIndex === actionsToRender.length - 1;

							return (
								<>
									<Button variant="link" size="sm" className="p-0 fw-normal" onClick={a.onClick}>
										{a.title}
									</Button>
									{!isLast && <span className="mx-1">&bull;</span>}
								</>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default InlineAlert;