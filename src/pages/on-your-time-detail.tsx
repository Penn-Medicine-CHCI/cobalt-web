import React, { FC, useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import ReactPlayer from 'react-player';

import useHeaderTitle from '@/hooks/use-header-title';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';

import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import BackgroundImageContainer from '@/components/background-image-container';

import colors from '@/jss/colors';

import { contentService, activityTrackingService } from '@/lib/services';
import { Content, ActivityActionId, AcivityTypeId } from '@/lib/models';

const useOnYourTimeDetailStyles = createUseStyles({
	mediaContainer: {
		paddingBottom: '56.25%',
	},
	mediaContent: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		padding: '15px 20px',
		position: 'absolute',
	},
	informationContainer: {
		color: colors.dark,
		padding: '10px 20px',
		backgroundColor: colors.white,
	},
	reactPlayerOuter: {
		position: 'relative',
		paddingTop: '56.25%',
		backgroundColor: colors.gray500,
		'& > div': {
			top: 0,
			left: 0,
			position: 'absolute',
		},
	},
});

interface RouteParams {
	contentId: string;
}

const OnYourTimeDetail: FC = () => {
	const { contentId } = useParams<RouteParams>();
	const classes = useOnYourTimeDetailStyles();
	const placeholderImage = useRandomPlaceholderImage();

	const [canEmbed, setCanEmbed] = useState(false);
	const [item, setItem] = useState<Content>();
	useHeaderTitle(item?.title ?? '');

	const fetchData = useCallback(async () => {
		const response = await contentService.fetchContent(contentId).fetch();
		setItem(response.content);
	}, [contentId]);

	const trackActivity = useCallback(async () => {
		if (!item) {
			return;
		}

		activityTrackingService
			.track({
				activityActionId: ActivityActionId.View,
				activityTypeId: AcivityTypeId.Content,
				context: {
					contentId: item.contentId,
				}
			})
			.fetch()
			.catch((e) => {
				// TODO: Swallowing error silently for now
			});
	}, [item]);

	useEffect(() => {
		if (!item || !item.url) {
			setCanEmbed(false);
			return;
		}

		setCanEmbed(ReactPlayer.canPlay(item.url));
	}, [item]);

	// Activity Tracking
	useEffect(() => {
		if (!item || canEmbed) {
			return;
		}

		// content that is not embedded, and has no "call to action" link
		// like INT_BLOG
		if (!item.url) {
			trackActivity();
		}
	}, [item, canEmbed, trackActivity]);

	return (
		<AsyncPage fetchData={fetchData}>
			<Breadcrumb
				breadcrumbs={[
					{
						to: '/',
						title: 'home',
					},
					{
						to: '/on-your-time',
						title: 'on your time',
					},
					{
						to: '/#',
						title: item?.contentTypeDescription ?? 'content',
					},
				]}
			/>

			<Container fluid="md">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{canEmbed ? (
							<div className={classes.reactPlayerOuter}>
								<ReactPlayer
									width="100%"
									height="100%"
									controls
									url={item?.url}
									onPlay={() => {
										trackActivity();
									}}
								/>
							</div>
						) : (
							<BackgroundImageContainer className={classes.mediaContainer} imageUrl={item?.imageUrl || placeholderImage}>
								<div className={classes.mediaContent}>
									<small className="text-white text-uppercase font-karla-bold">{item?.newFlag ? 'NEW' : ''}</small>
								</div>
							</BackgroundImageContainer>
						)}
						<div className={classes.informationContainer}>
							<h5 className="mb-0">{item?.title}</h5>
							{item?.author ? <p className="mb-1">by {item?.author}</p> : <p className="mb-1">&nbsp;</p>}

							<div className="d-flex">
								<small className="text-muted text-uppercase font-karla-bold">{item?.contentTypeLabel}</small>

								{item?.duration && <small className="text-muted text-uppercase font-karla-bold ml-auto">{item?.duration}</small>}
							</div>
						</div>
					</Col>
				</Row>
			</Container>

			<Container className="pt-5 pb-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<p className="mb-0" dangerouslySetInnerHTML={{ __html: item?.description || '' }} />
					</Col>
				</Row>

				{!canEmbed && item?.url && (
					<Row className="mt-5 text-center">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<Button
								as="a"
								className="d-inline-block"
								variant="primary"
								href={item.url}
								target="_blank"
								onClick={() => {
									trackActivity();
								}}
							>
								{item.callToAction}
							</Button>
						</Col>
					</Row>
				)}
			</Container>
		</AsyncPage>
	);
};

export default OnYourTimeDetail;
