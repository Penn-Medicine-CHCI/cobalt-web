import Header from '@/components/header';
import HeaderUnauthenticated from '@/components/header-unauthenticated';
import HeaderV2 from '@/components/header-v2';
import useAccount from '@/hooks/use-account';
import React, { Suspense, useMemo } from 'react';
import { Outlet, useRouteError } from 'react-router-dom';
import ErrorDisplay from './components/error-display';
import Loader from './components/loader';
import Footer from './components/footer';

interface AppDefaultLayoutProps {
	hideHeaderButtons?: boolean;
	unauthenticated?: boolean;
}

export const AppHeader = ({ unauthenticated }: AppDefaultLayoutProps) => {
	const { institution } = useAccount();

	const activeHeader = useMemo(() => {
		if (unauthenticated) {
			return <HeaderUnauthenticated />;
		} else if (institution?.featuresEnabled) {
			return <HeaderV2 />;
		} else {
			return <Header />;
		}
	}, [institution?.featuresEnabled, unauthenticated]);

	return activeHeader;
};

export const AppDefaultLayout = (layoutProps: AppDefaultLayoutProps) => {
	return (
		<>
			<AppHeader {...layoutProps} />

			<Suspense fallback={<Loader />}>
				<Outlet />
			</Suspense>

			<Footer />
		</>
	);
};

export const AppErrorDefaultLayout = (layoutProps: AppDefaultLayoutProps) => {
	const error = useRouteError();

	return (
		<>
			<AppHeader {...layoutProps} />

			<ErrorDisplay
				error={error}
				showBackButton={false}
				showRetryButton
				onRetryButtonClick={() => {
					window.location.reload();
				}}
			/>

			<Footer />
		</>
	);
};
