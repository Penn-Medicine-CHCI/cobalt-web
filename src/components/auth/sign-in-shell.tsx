import React, { ReactNode, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { SignInCobaltProps } from '@/components/auth/sign-in-cobalt';
import { SignInPatient } from '@/components/auth/sign-in-patient';
import { SignInStaff } from '@/components/auth/sign-in-staff';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { config } from '@/config';
import { AccountSource, AccountSourceId, AnalyticsNativeEventTypeId } from '@/lib/models';
import { accountService, analyticsService } from '@/lib/services';

interface SignInShellProps {
	defaultView(signInProps: SignInCobaltProps): ReactNode;
}

export const SignInShell = ({ defaultView }: SignInShellProps) => {
	const handleError = useHandleError();
	const { institution, isIntegratedCarePatient, isIntegratedCareStaff } = useAccount();
	const navigate = useNavigate();

	useEffect(() => {
		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_SIGN_IN);
	}, []);

	const handleEnterAnonymouslyButtonClick = useCallback(async () => {
		try {
			const { accessToken } = await accountService
				.createAnonymousAccount({
					accountSourceId: AccountSourceId.ANONYMOUS,
				})
				.fetch();

			navigate({
				pathname: '/auth',
				search: `?accessToken=${accessToken}`,
			});
		} catch (error) {
			handleError(error);
		}
	}, [handleError, navigate]);

	const handleAccountSourceClick = useCallback(
		async (accountSource: AccountSource) => {
			if (accountSource.accountSourceId === AccountSourceId.ANONYMOUS) {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_ACCOUNT_SOURCE, {
					accountSourceId: accountSource.accountSourceId,
				});

				handleEnterAnonymouslyButtonClick();
			} else if (accountSource.accountSourceId === AccountSourceId.EMAIL_PASSWORD) {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_ACCOUNT_SOURCE, {
					accountSourceId: accountSource.accountSourceId,
				});

				navigate('/sign-in/email');
			} else if (accountSource.accountSourceId === AccountSourceId.MYCHART) {
				// Construct a query string that preserves analytics information
				const analyticsFingerprint = analyticsService.getFingerprint();
				const analyticsSessionId = analyticsService.getSessionId();
				const analyticsReferringCampaign = analyticsService.getReferringCampaign();
				const analyticsReferringMessageId = analyticsService.getReferringMessageId();

				let redirectSearchComponents = ['redirectImmediately=true'];

				redirectSearchComponents.push(
					`${analyticsService.getFingerprintQueryParameterName()}=${encodeURIComponent(analyticsFingerprint)}`
				);

				redirectSearchComponents.push(
					`${analyticsService.getSessionIdQueryParameterName()}=${encodeURIComponent(analyticsSessionId)}`
				);

				if (analyticsReferringCampaign)
					redirectSearchComponents.push(
						`${analyticsService.getReferringCampaignQueryParameterName()}=${encodeURIComponent(
							analyticsReferringCampaign
						)}`
					);

				if (analyticsReferringMessageId)
					redirectSearchComponents.push(
						`${analyticsService.getReferringMessageIdQueryParameterName()}=${encodeURIComponent(
							analyticsReferringMessageId
						)}`
					);

				const mychartUrl = new URL(config.apiBaseUrl);
				mychartUrl.pathname = `/institutions/${institution?.institutionId}/mychart-authentication-url`;
				mychartUrl.search = redirectSearchComponents.join('&');

				analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_ACCOUNT_SOURCE, {
					accountSourceId: accountSource.accountSourceId,
				});

				window.location.href = mychartUrl.toString();
			} else if (accountSource.ssoUrl) {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_ACCOUNT_SOURCE, {
					accountSourceId: accountSource.accountSourceId,
				});

				window.location.href = accountSource.ssoUrl;
			}
		},
		[handleEnterAnonymouslyButtonClick, institution?.institutionId, navigate]
	);

	const signInProps: SignInCobaltProps = {
		onAccountSourceClick: handleAccountSourceClick,
	};

	if (isIntegratedCarePatient) {
		return <SignInPatient {...signInProps} />;
	} else if (isIntegratedCareStaff) {
		return <SignInStaff {...signInProps} />;
	}

	return <>{defaultView(signInProps)}</>;
};
