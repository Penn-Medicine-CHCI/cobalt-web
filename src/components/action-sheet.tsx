import React, { FC, PropsWithChildren } from 'react';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';

import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { createUseThemedStyles } from '@/jss/theme';

const transitionDuration = 200;

const useStyles = createUseThemedStyles((theme) => ({
	floatingActionButton: {
		bottom: 36,
		right: 20,
		zIndex: 3,
		position: 'fixed',
		border: 0,
		appearance: 'none',
		width: 48,
		height: 48,
		borderRadius: 27,
		color: theme.colors.n0,
		backgroundColor: theme.colors.p500,
		transition: `${transitionDuration}ms transform`,
		'&:focus': {
			outline: 'none',
		},
	},
	floatingActionButtonOpen: {
		transform: 'rotate(135deg)',
	},
	addIcon: {
		'& path': {
			fill: 'white',
		},
	},
	actionSheet: {
		left: 0,
		right: 0,
		zIndex: 2,
		bottom: 98,
		padding: '0 20px',
		position: 'fixed',
	},
	shadow: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1,
		position: 'fixed',
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
	},
	'@global': {
		'.slide-fade-enter': {
			opacity: 0,
			transform: 'translateY(48px)',
		},
		'.slide-fade-enter-active': {
			opacity: 1,
			transform: 'translateY(0)',
		},
		'.slide-fade-exit': {
			opacity: 1,
			transform: 'translateY(0)',
		},
		'.slide-fade-exit-active': {
			opacity: 0,
			transform: 'translateY(48px)',
		},
		'.slide-fade-enter-active, .slide-fade-exit-active': {
			transition: `opacity ${transitionDuration}ms, transform ${transitionDuration}ms`,
		},
		'.fade-enter': {
			opacity: 0,
		},
		'.fade-enter-active': {
			opacity: 1,
		},
		'.fade-exit': {
			opacity: 1,
		},
		'.fade-exit-active': {
			opacity: 0,
		},
		'.fade-enter-active, .fade-exit-active': {
			transition: `opacity ${transitionDuration}ms`,
		},
	},
}));

interface ActionSheetProps extends PropsWithChildren {
	show: boolean;
	onShow(): void;
	onHide(): void;
}

const ActionSheet: FC<ActionSheetProps> = ({ show, onShow, onHide, children }) => {
	const classes = useStyles();

	function handleAddSessionButtonClick() {
		if (show) {
			onHide();
		} else {
			onShow();
		}
	}

	function handleShadowClick() {
		onHide();
	}

	return (
		<>
			<CSSTransition
				in={show}
				timeout={transitionDuration}
				mountOnEnter={true}
				unmountOnExit={true}
				classNames={'slide-fade'}
			>
				<div className={classes.actionSheet}>{children}</div>
			</CSSTransition>
			<CSSTransition
				in={show}
				timeout={transitionDuration}
				mountOnEnter={true}
				unmountOnExit={true}
				classNames={'fade'}
			>
				<div className={classes.shadow} onClick={handleShadowClick} />
			</CSSTransition>
			<button
				className={classNames({
					[classes.floatingActionButton]: true,
					[classes.floatingActionButtonOpen]: show,
				})}
				onClick={handleAddSessionButtonClick}
			>
				<PlusIcon width={24} height={24} className={classes.addIcon} />
			</button>
		</>
	);
};

export default ActionSheet;
