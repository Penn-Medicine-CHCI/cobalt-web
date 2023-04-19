import React, { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import classNames from 'classnames';

import { accountService, institutionService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as Logo } from '@/assets/logos/logo-small.svg';
import {
	AccountSourceId,
	AccountSourceDisplayStyleId,
	INSTITUTION_BLURB_TYPE_ID,
	InstitutionBlurb,
} from '@/lib/models';
import config from '@/lib/config';
import Blurb from '@/components/blurb';
import AsyncWrapper from '@/components/async-page';
import { useAppRootLoaderData } from '@/routes/root';

const useSignInStyles = createUseThemedStyles((theme) => ({
	signInOuter: {
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
	},
	signIn: {
		paddingTop: 96,
		[mediaQueries.lg]: {
			paddingTop: 32,
		},
	},
	signInInner: {
		maxWidth: 408,
		margin: '0 auto',
	},
}));

const accountSourceVariantMap = {
	[AccountSourceDisplayStyleId.PRIMARY]: 'primary',
	[AccountSourceDisplayStyleId.SECONDARY]: 'outline-primary',
	[AccountSourceDisplayStyleId.TERTIARY]: 'link',
};

const SignIn: FC = () => {
	const { subdomain } = useAppRootLoaderData();

	const handleError = useHandleError();
	const { institution, accountSources } = useAccount();
	const classes = useSignInStyles();
	const navigate = useNavigate();
	const [institutionBlurbs, setInstitutionBlurbs] = useState<Record<INSTITUTION_BLURB_TYPE_ID, InstitutionBlurb>>();

	const fetchData = useCallback(async () => {
		try {
			const { institutionBlurbsByInstitutionBlurbTypeId } = await institutionService
				.getInstitutionBlurbs()
				.fetch();

			setInstitutionBlurbs(institutionBlurbsByInstitutionBlurbTypeId);
		} catch (error) {
			// don't throw
		}
	}, []);

	const handleEnterAnonymouslyButtonClick = async () => {
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
	};

	return (
		<Container fluid className={classes.signInOuter}>
			<Container className={classes.signIn}>
				<Row className="mb-2">
					<Col>
						<div className={classes.signInInner}>
							<div className="mb-6 text-center">
								<Logo className="text-primary" />
							</div>

							<h1 className="mb-4 text-center">
								Connecting {institution?.name} employees to mental health resources
							</h1>
							<p className="mb-6 mb-lg-8 fs-large text-center">
								Find the right level of mental healthcare, personalized for you.
							</p>
							<hr className="mb-6" />
							<h2 className="mb-6 text-center">Sign in with</h2>

							<div className="text-center mb-3">
								{accountSources.map((accountSource, index) => {
									const isLast = accountSources.length - 1 === index;
									let variant =
										accountSourceVariantMap[accountSource.accountSourceDisplayStyleId] || 'primary';

									return (
										<Button
											key={`account-source-${index}`}
											className={classNames('d-block w-100', {
												'mb-4': !isLast,
											})}
											variant={variant}
											data-testid={`signIn-${accountSource.accountSourceId}`}
											onClick={() => {
												if (accountSource.accountSourceId === AccountSourceId.ANONYMOUS) {
													handleEnterAnonymouslyButtonClick();
												} else if (
													accountSource.accountSourceId === AccountSourceId.EMAIL_PASSWORD
												) {
													navigate('/sign-in/email');
												} else if (accountSource.accountSourceId === AccountSourceId.MYCHART) {
													const mychartUrl = new URL(config.COBALT_WEB_API_BASE_URL);
													mychartUrl.pathname = `/institutions/${institution?.institutionId}/mychart-authentication-url`;
													mychartUrl.search = `redirectImmediately=true`;

													window.location.href = mychartUrl.toString();
												} else if (accountSource.ssoUrl) {
													window.location.href = accountSource.ssoUrl;
												}
											}}
										>
											{accountSource.authenticationDescription}
										</Button>
									);
								})}
							</div>
						</div>
					</Col>
				</Row>
				<AsyncWrapper fetchData={fetchData}>
					{institutionBlurbs && institutionBlurbs?.[INSTITUTION_BLURB_TYPE_ID.INTRO] && (
						<Row>
							<Col>
								<Blurb
									modalTitle={institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].title ?? ''}
									modalDestription={
										institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].description ?? ''
									}
									speechBubbleTitle={institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].title ?? ''}
									speechBubbleDestription={
										institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].shortDescription ?? ''
									}
									teamMemberImageUrl={
										institutionBlurbs[INSTITUTION_BLURB_TYPE_ID.INTRO].institutionTeamMembers?.[0]
											.imageUrl ?? ''
									}
								/>
							</Col>
						</Row>
					)}
				</AsyncWrapper>
			</Container>
		</Container>
	);
};

export default SignIn;
