import CollectPhoneModal from '@/components/collect-phone-modal';
import { CrisisAnalyticsEvent, ScreeningAnalyticsEvent } from '@/contexts/analytics-context';
import useAccount from '@/hooks/use-account';
import useAnalytics from '@/hooks/use-analytics';
import useHandleError from '@/hooks/use-handle-error';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import { ERROR_CODES } from '@/lib/http-client';
import {
	ScreeningFlowVersion,
	ScreeningSession,
	ScreeningSessionDestination,
	ScreeningSessionDestinationId,
} from '@/lib/models';
import { screeningService } from '@/lib/services';
import React, { useMemo } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export function useScreeningNavigation() {
	const location = useLocation();
	const navigate = useNavigate();
	const { openInCrisisModal } = useInCrisisModal();
	const { trackEvent } = useAnalytics();

	const navigateToDestination = useCallback(
		(destination?: ScreeningSessionDestination, params?: Record<string, any>, replace = false) => {
			switch (destination?.screeningSessionDestinationId) {
				case ScreeningSessionDestinationId.CRISIS:
					trackEvent(CrisisAnalyticsEvent.presentScreeningCrisis());
					openInCrisisModal(true);
					return;
				case ScreeningSessionDestinationId.CONTENT_LIST:
					navigate(
						{
							pathname: '/resource-library',
							search: new URLSearchParams({ recommended: 'true', ...params }).toString(),
						},
						{
							replace,
						}
					);
					return;
				case ScreeningSessionDestinationId.GROUP_SESSION_LIST:
					navigate(
						{
							pathname: '/in-the-studio',
							search: new URLSearchParams(params).toString(),
						},
						{
							replace,
						}
					);
					return;
				case ScreeningSessionDestinationId.ONE_ON_ONE_PROVIDER_LIST:
				default: {
					navigate(
						{
							pathname: '/connect-with-support',
							search: new URLSearchParams(params).toString(),
						},
						{
							replace,
						}
					);
					return;
				}
			}
		},
		[navigate, openInCrisisModal, trackEvent]
	);

	const navigateToQuestion = useCallback(
		(contextId: string) => {
			navigate(`/screening-questions/${contextId}`, { state: location.state });
		},
		[location.state, navigate]
	);

	const navigateToNext = useCallback(
		(session: ScreeningSession) => {
			if (session?.nextScreeningQuestionContextId) {
				navigateToQuestion(session.nextScreeningQuestionContextId);
			} else if (session?.screeningSessionDestination) {
				navigateToDestination(session.screeningSessionDestination);
			}
		},
		[navigateToDestination, navigateToQuestion]
	);

	return {
		navigateToDestination,
		navigateToQuestion,
		navigateToNext,
	};
}

export function useScreeningFlow(screeningFlowId?: string, instantiateOnLoad: boolean = true) {
	const { isImmediateSession } = useAccount();
	const [searchParams] = useSearchParams();
	const isSkipped = searchParams.get('skipped') === 'true';
	const [didCheckScreeningSessions, setDidCheckScreeningSessions] = useState(!screeningFlowId || isSkipped);
	const [screeningSessions, setScreeningSessions] = useState<ScreeningSession[]>([]);
	const [showPhoneModal, setShowPhoneModal] = useState(false);
	const { trackEvent } = useAnalytics();

	const [activeFlowVersion, setActiveFlowVersion] = useState<ScreeningFlowVersion>();
	const handleError = useHandleError();
	const { navigateToNext, navigateToDestination } = useScreeningNavigation();

	const incompleteSessions = useMemo(() => {
		return screeningSessions.filter((session) => !session.completed);
	}, [screeningSessions]);

	const hasCompletedScreening = useMemo(() => {
		return screeningSessions.some((session) => session.completed && !session.skipped);
	}, [screeningSessions]);

	const startScreeningFlow = useCallback(() => {
		if (incompleteSessions.length === 0) {
			screeningService
				.createScreeningSession({
					screeningFlowVersionId: activeFlowVersion?.screeningFlowVersionId,
				})
				.fetch()
				.then((sessionResponse) => {
					navigateToNext(sessionResponse.screeningSession);
				})
				.catch((e) => {
					if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
						handleError(e);
					}
				});
		} else {
			navigateToNext(incompleteSessions[incompleteSessions.length - 1]);
		}
	}, [activeFlowVersion?.screeningFlowVersionId, handleError, incompleteSessions, navigateToNext]);

	useEffect(() => {
		if (isImmediateSession || isSkipped) {
			setDidCheckScreeningSessions(true);
			return;
		}

		if (!screeningFlowId) {
			return;
		}

		const fetchScreeningsRequest = screeningService.getScreeningSessionsByFlowId({
			screeningFlowId,
		});
		const fetchFlowVersionsRequest = screeningService.getScreeningFlowVersionsByFlowId({ screeningFlowId });

		Promise.all([fetchScreeningsRequest.fetch(), fetchFlowVersionsRequest.fetch()])
			.then(([screeningsResponse, versionsResponse]) => {
				setScreeningSessions(screeningsResponse.screeningSessions);
				const activeVersion = versionsResponse.screeningFlowVersions.find(
					(version) => version.screeningFlowVersionId === versionsResponse.activeScreeningFlowVersionId
				);

				setActiveFlowVersion(activeVersion);
			})
			.catch((e) => {
				if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			fetchScreeningsRequest.abort();
		};
	}, [handleError, isImmediateSession, isSkipped, screeningFlowId]);

	const checkAndStartScreeningFlow = useCallback(() => {
		if (!activeFlowVersion) {
			return;
		}

		if (!hasCompletedScreening && activeFlowVersion.phoneNumberRequired) {
			setShowPhoneModal(true);
		} else if (!hasCompletedScreening) {
			startScreeningFlow();
		} else {
			setDidCheckScreeningSessions(true);
		}
	}, [activeFlowVersion, hasCompletedScreening, startScreeningFlow]);

	useEffect(() => {
		if (!instantiateOnLoad) {
			return;
		}

		checkAndStartScreeningFlow();
	}, [instantiateOnLoad, checkAndStartScreeningFlow]);

	const renderedCollectPhoneModal = (
		<CollectPhoneModal
			show={showPhoneModal}
			skippable={activeFlowVersion?.skippable}
			onSkip={() => {
				trackEvent(ScreeningAnalyticsEvent.skipPhoneNumberPrompt());

				if (!activeFlowVersion?.screeningFlowVersionId) {
					return;
				}

				screeningService
					.skipScreeningFlowVersion(activeFlowVersion?.screeningFlowVersionId)
					.fetch()
					.then((response) => {
						navigateToDestination(
							response.screeningSession.screeningSessionDestination,
							{ skipped: true },
							true // replace
						);
					})
					.catch((e) => {
						if ((e as any).code !== ERROR_CODES.REQUEST_ABORTED) {
							handleError(e);
						}
					});
			}}
			onSuccess={() => {
				if (!screeningFlowId) {
					return;
				}

				setShowPhoneModal(false);

				startScreeningFlow();
			}}
		/>
	);

	return {
		didCheckScreeningSessions,
		hasCompletedScreening,
		renderedCollectPhoneModal,
		checkAndStartScreeningFlow,
	};
}
