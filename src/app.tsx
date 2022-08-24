import React, { FC, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import useAccount from '@/hooks/use-account';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import config from '@/lib/config';

import Alert from '@/components/alert';
import ErrorModal from '@/components/error-modal';
import Footer from '@/components/footer';
import InCrisisModal from '@/components/in-crisis-modal';
import Loader from '@/components/loader';
import PrivateRoute from '@/components/private-route';
import ReauthModal from '@/components/reauth-modal';

import { AppRoutes } from '@/routes';

import { useCustomBootstrapStyles } from '@/jss/hooks/use-custom-bootstrap-styles';
import { useGlobalStyles } from '@/jss/hooks/use-global-styles';

import { AccountProvider } from '@/contexts/account-context';
import { AlertProvider } from '@/contexts/alert-context';
import { AnalyticsProvider } from '@/contexts/analytics-context';
import { BookingProvider } from '@/contexts/booking-context';
import { ErrorModalProvider } from '@/contexts/error-modal-context';
import { InCrisisModalProvider } from '@/contexts/in-crisis-modal-context';
import { ReauthModalProvider } from '@/contexts/reauth-modal-context';

import DownForMaintenance from '@/pages/down-for-maintenance';

import useUrlViewTracking from './hooks/use-url-view-tracking';
import { CobaltThemeProvider, useCobaltTheme } from './jss/theme';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-multi-carousel/lib/styles.css';
import './scss/main.scss';

const AppWithProviders: FC = () => {
	const { show, isCall, closeInCrisisModal } = useInCrisisModal();
	const { account, institution, initialized } = useAccount();

	const { pathname } = useLocation();
	const { colors } = useCobaltTheme();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	useUrlViewTracking();

	useEffect(() => {
		const links: NodeListOf<HTMLLinkElement> = document.querySelectorAll("link[rel~='icon']");

		links.forEach((link) => {
			const faviconUrl = link.href || `${window.location.origin}/favicon.ico`;
			const faviconWidth = parseInt(link.sizes.value.split('x')[0], 10) || 16;
			const faviconHeight = parseInt(link.sizes.value.split('x')[1], 10) || 16;

			function onImageLoaded() {
				// Create a canvas to draw on
				const canvas = document.createElement('canvas');
				canvas.width = faviconWidth;
				canvas.height = faviconHeight;

				// Get the canvas context
				const context = canvas.getContext('2d');
				if (!context) {
					return;
				}

				// Use contenxt to draw the favicon
				context.drawImage(img, 0, 0);

				// Change the color of the favicon
				context.globalCompositeOperation = 'source-in';
				context.fillStyle = colors.p500;
				context.fillRect(0, 0, faviconWidth, faviconHeight);
				context.fill();

				// Set the favicon element to the recolored version (Chrome needs image/x-icon)
				link.type = 'image/x-icon';
				link.href = canvas.toDataURL();
			}

			const img = document.createElement('img');
			img.addEventListener('load', onImageLoaded);
			img.src = faviconUrl;
		});
	}, [colors.p500]);

	if (!initialized) {
		return <Loader />;
	}

	return (
		<>
			<InCrisisModal show={show} isCall={isCall} onHide={closeInCrisisModal} />
			<ErrorModal />
			<ReauthModal />

			<Alert />

			<Routes>
				{AppRoutes.map((config, groupIndex) => {
					return (
						<Route key={groupIndex} element={<config.layout />}>
							{config.routes.map((route, index) => {
								const isEnabled =
									typeof route.routeGuard === 'function'
										? route.routeGuard({
												account,
												institution,
										  })
										: true;

								if (!isEnabled) {
									return null;
								}

								return (
									<Route
										key={index}
										path={route.path}
										element={
											<Suspense fallback={<Loader />}>
												{route.private ? (
													<PrivateRoute>
														<route.main />
													</PrivateRoute>
												) : (
													<route.main />
												)}
											</Suspense>
										}
									/>
								);
							})}
						</Route>
					);
				})}
			</Routes>

			<Footer />
		</>
	);
};

const ThemedApp: FC = () => {
	useGlobalStyles();
	useCustomBootstrapStyles();

	// Can put application blocking pages here, while still using styles
	if (config.COBALT_WEB_DOWN_FOR_MAINTENANCE === 'true') {
		return <DownForMaintenance />;
	}

	return (
		<ErrorModalProvider>
			<ReauthModalProvider>
				<AccountProvider>
					<AlertProvider>
						<BookingProvider>
							<InCrisisModalProvider>
								<AnalyticsProvider>
									<AppWithProviders />
								</AnalyticsProvider>
							</InCrisisModalProvider>
						</BookingProvider>
					</AlertProvider>
				</AccountProvider>
			</ReauthModalProvider>
		</ErrorModalProvider>
	);
};

const App: FC = () => {
	return (
		<Router>
			<CobaltThemeProvider>
				<ThemedApp />
			</CobaltThemeProvider>
		</Router>
	);
};

export default App;
