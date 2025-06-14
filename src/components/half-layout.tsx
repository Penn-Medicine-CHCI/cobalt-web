import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as Logo } from '@/assets/logos/logo-cobalt-horizontal.svg';

const useStyles = createUseThemedStyles((theme) => ({
	halfLayout: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 0,
		display: 'flex',
		position: 'fixed',
		[mediaQueries.lg]: {
			display: 'block',
			position: 'static',
		},
	},
	col: {
		flex: 1,
		flexShrink: 0,
		display: 'flex',
		position: 'relative',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		[mediaQueries.lg]: {
			position: 'static',
			padding: '56px 0',
		},
	},
	leftColInner: {
		width: '100%',
		overflowY: 'auto',
		padding: '64px 0',
		[mediaQueries.lg]: {
			padding: 0,
			overflowY: 'visible',
		},
	},
	rightCol: {
		flex: 1,
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
		[mediaQueries.lg]: {
			display: 'none',
		},
	},
	logoOuter: {
		marginBottom: 46,
		textAlign: 'center',
	},
	form: {
		width: '80%',
		maxWidth: 380,
		margin: '0 auto',
	},
	illustration: {
		maxWidth: '80%',
		margin: '0 auto',
		display: 'block',
	},
}));

interface HalfLayoutProps {
	leftColChildren(className: string): JSX.Element;
	rightColChildren(className: string): JSX.Element;
}

const HalfLayout = ({ leftColChildren, rightColChildren }: HalfLayoutProps) => {
	const classes = useStyles();

	return (
		<div className={classes.halfLayout}>
			<div className={classes.col}>
				<div className={classes.leftColInner}>
					<div className={classes.logoOuter}>
						<Link to="/">
							<Logo />
						</Link>
					</div>
					{leftColChildren(classes.form)}
				</div>
			</div>
			<div className={classNames(classes.col, classes.rightCol)}>
				<div className="w-100">{rightColChildren(classes.illustration)}</div>
			</div>
		</div>
	);
};

export default HalfLayout;
