import React, { FC, useState, useEffect, useCallback, useContext, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';

import Loader from '@/components/loader';
import ErrorDisplay from '@/components/error-display';
import { ERROR_CODES } from '@/lib/http-client';
import { isErrorConfig } from '@/lib/utils/error-utils';
import { ReauthModalContext } from '@/contexts/reauth-modal-context';

enum DISPLAY_STATES {
	LOADING = 'LOADING',
	SUCCESS = 'SUCCESS',
	ERROR = 'ERROR',
}

interface AsyncPageProps extends PropsWithChildren {
	fetchData(): void;
	abortFetch?(): void;
	showBackButton?: boolean;
	showRetryButton?: boolean;
}

const AsyncPage: FC<AsyncPageProps> = ({
	children,
	fetchData,
	abortFetch,
	showBackButton = true,
	showRetryButton = true,
}) => {
	const navigate = useNavigate();
	const [fetchPageDataError, setFetchPageDataError] = useState<unknown | undefined>(undefined);
	const [displayState, setDisplayState] = useState(DISPLAY_STATES.LOADING);
	const { setShowReauthModal, setSignOnUrl } = useContext(ReauthModalContext);

	const fetchPageData = useCallback(async () => {
		setDisplayState(DISPLAY_STATES.LOADING);
		setFetchPageDataError(undefined);

		try {
			await fetchData();
			setDisplayState(DISPLAY_STATES.SUCCESS);
		} catch (error) {
			if (isErrorConfig(error)) {
				if (error.code === ERROR_CODES.REQUEST_ABORTED) {
					// nothing to handle
					// -- AsyncPage likely unmounted
					return;
				}

				if (error.code === 'AUTHENTICATION_REQUIRED') {
					if (error.apiError?.accessTokenStatus === 'PARTIALLY_EXPIRED') {
						if (error.apiError.signOnUrl) {
							setSignOnUrl(error.apiError.signOnUrl);
						}

						setShowReauthModal(true);
						return;
					}

					navigate('/sign-in', { replace: true });
					return;
				}
			}

			setFetchPageDataError(error);
			setDisplayState(DISPLAY_STATES.ERROR);
		}
	}, [fetchData, navigate, setShowReauthModal, setSignOnUrl]);

	useEffect(() => {
		fetchPageData();

		return () => {
			typeof abortFetch === 'function' && abortFetch();
		};
	}, [fetchPageData, abortFetch]);

	function getDisplayState() {
		switch (displayState) {
			case DISPLAY_STATES.LOADING:
				return <Loader />;
			case DISPLAY_STATES.SUCCESS:
				return children;
			case DISPLAY_STATES.ERROR:
				return (
					<ErrorDisplay
						error={fetchPageDataError}
						showBackButton={showBackButton}
						showRetryButton={showRetryButton}
						onRetryButtonClick={fetchPageData}
					/>
				);
			default:
				return <></>;
		}
	}

	return <>{getDisplayState()}</>;
};

export default AsyncPage;
