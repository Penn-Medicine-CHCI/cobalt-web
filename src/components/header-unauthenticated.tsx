import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Link, useMatch, useMatches, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import { RouteHandle } from '@/routes';
import InCrisisHeaderButton from '@/components/in-crisis-header-button';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as Logo } from '@/assets/logos/logo-cobalt-horizontal.svg';

const useHeaderStyles = createUseThemedStyles((theme) => ({
	header: {
		top: 0,
		left: 0,
		right: 0,
		zIndex: 4,
		height: 60,
		display: 'flex',
		position: 'fixed',
		padding: '0 40px',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n0,
		[mediaQueries.lg]: {
			padding: '0 20px',
		},
	},
}));

export interface HeaderUnauthenticatedProps {
	hideSignInButton?: boolean;
}

const HeaderUnauthenticated = ({ hideSignInButton }: HeaderUnauthenticatedProps) => {
	const { institution } = useAccount();
	const navigate = useNavigate();
	const classes = useHeaderStyles();
	const header = useRef<HTMLElement>(null);
	const signInMatch = !!useMatch({
		path: '/sign-in',
		end: true,
	});

	const handleWindowResize = useCallback(() => {
		setBodyPadding();
	}, []);

	function setBodyPadding() {
		if (!header.current) {
			document.body.style.paddingTop = '0px';
			return;
		}

		const headerHeight = header.current.clientHeight;
		document.body.style.paddingTop = `${headerHeight}px`;
	}

	useEffect(() => {
		setBodyPadding();
		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);
			document.body.style.paddingTop = '0px';
		};
	}, [handleWindowResize]);

	const routeMatches = useMatches();
	const hideHeader = useMemo(
		() => routeMatches.some((match) => (match.handle as RouteHandle | undefined)?.hideHeader),
		[routeMatches]
	);
	if (hideHeader) {
		return null;
	}

	return (
		<header ref={header} className={classes.header}>
			<Link className="d-block" to="/sign-in">
				<Logo className="text-primary d-block" />
			</Link>

			<div className="d-flex align-items-center">
				{!hideSignInButton && !signInMatch && (
					<Button
						className="py-1"
						size="sm"
						onClick={() => {
							navigate('/sign-in');
						}}
					>
						Sign In
					</Button>
				)}

				{institution?.epicFhirEnabled && <InCrisisHeaderButton className="ms-2" />}
			</div>
		</header>
	);
};

export default HeaderUnauthenticated;
