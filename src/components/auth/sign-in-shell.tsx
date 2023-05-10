import React, { ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { SignInCobaltProps } from '@/components/auth/sign-in-cobalt';
import { SignInPatient } from '@/components/auth/sign-in-patient';
import { SignInStaff } from '@/components/auth/sign-in-staff';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import config from '@/lib/config';
import { AccountSource, AccountSourceId, UserExperienceTypeId } from '@/lib/models';
import { accountService } from '@/lib/services';
import { useAppRootLoaderData } from '@/routes/root';

interface SignInShellProps {
	defaultView(signInProps: SignInCobaltProps): ReactNode;
}

export const SignInShell = ({ defaultView }: SignInShellProps) => {
	const { subdomain } = useAppRootLoaderData();

	const handleError = useHandleError();
	const { institution } = useAccount();
	const navigate = useNavigate();

	const handleEnterAnonymouslyButtonClick = useCallback(async () => {
		try {
			const { accessToken } = await accountService
				.createAnonymousAccount({
					subdomain,
				})
				.fetch();

			navigate({
				pathname: '/auth',
				search: `?accessToken=${accessToken}`,
			});
		} catch (error) {
			handleError(error);
		}
	}, [handleError, navigate, subdomain]);

	const handleAccountSourceClick = useCallback(
		async (accountSource: AccountSource) => {
			if (accountSource.accountSourceId === AccountSourceId.ANONYMOUS) {
				handleEnterAnonymouslyButtonClick();
			} else if (accountSource.accountSourceId === AccountSourceId.EMAIL_PASSWORD) {
				navigate('/sign-in/email');
			} else if (accountSource.accountSourceId === AccountSourceId.MYCHART) {
				const mychartUrl = new URL(config.COBALT_WEB_API_BASE_URL);
				mychartUrl.pathname = `/institutions/${institution?.institutionId}/mychart-authentication-url`;
				mychartUrl.search = `redirectImmediately=true`;

				window.location.href = mychartUrl.toString();
			} else if (accountSource.ssoUrl) {
				window.location.href = accountSource.ssoUrl;
			}
		},
		[handleEnterAnonymouslyButtonClick, institution?.institutionId, navigate]
	);

	const signInProps: SignInCobaltProps = {
		onAccountSourceClick: handleAccountSourceClick,
	};

	if (institution?.integratedCareEnabled) {
		if (institution?.userExperienceTypeId === UserExperienceTypeId.PATIENT) {
			return <SignInPatient {...signInProps} />;
		} else if (institution?.userExperienceTypeId === UserExperienceTypeId.STAFF) {
			return <SignInStaff {...signInProps} />;
		}
	}

	return <>{defaultView(signInProps)}</>;
};