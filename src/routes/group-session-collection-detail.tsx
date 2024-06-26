import React from 'react';
import { Link, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { GROUP_SESSION_STATUS_ID, GROUP_SESSION_SORT_ORDER } from '@/lib/models';
import { groupSessionsService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import HeroContainer from '@/components/hero-container';
import StudioEvent from '@/components/studio-event';
import NoData from '@/components/no-data';
import { GroupSessionDetailNavigationSource } from './group-session-detail';
import IneligibleBookingModal from '@/components/ineligible-booking-modal';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { groupSessionCollectionUrlName } = params as { groupSessionCollectionUrlName: string };
	const [{ groupSessionCollections }, { groupSessions }] = await Promise.all([
		groupSessionsService.getGroupSessionCollections().fetch(),
		groupSessionsService
			.getGroupSessions({
				viewType: 'PATIENT',
				groupSessionStatusId: GROUP_SESSION_STATUS_ID.ADDED,
				orderBy: GROUP_SESSION_SORT_ORDER.START_TIME_ASCENDING,
				groupSessionCollectionUrlName,
				pageSize: 1000,
				pageNumber: 0,
			})
			.fetch(),
	]);

	const groupSessionCollection = groupSessionCollections.find(
		(collection) => collection.urlName === groupSessionCollectionUrlName
	);

	return { groupSessionCollection, groupSessions };
};

export const Component = () => {
	const { groupSessionCollection, groupSessions } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const { institution } = useAccount();
	const { renderedPreScreeningLoader } = useScreeningFlow({
		screeningFlowId: institution.groupSessionsScreeningFlowId,
	});

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	return (
		<>
			<Helmet>
				<title>Cobalt | Group Sessions - {groupSessionCollection?.title ?? ''}</title>
			</Helmet>

			<HeroContainer className="bg-n75">
				<p className="mb-5 text-gray fs-large text-center">Group Sessions</p>
				<h1 className="mb-6 text-center">{groupSessionCollection?.title}</h1>
				<p
					className="fs-large text-center"
					dangerouslySetInnerHTML={{ __html: groupSessionCollection?.description ?? '' }}
				/>
			</HeroContainer>

			<IneligibleBookingModal uiType="group-session" />

			<Container className="py-14">
				{groupSessions.length > 0 ? (
					<Row>
						{groupSessions.map((groupSession) => {
							return (
								<Col md={6} lg={4} key={groupSession.groupSessionId} className="mb-8">
									<Link
										className="d-block text-decoration-none h-100"
										to={`/group-sessions/${groupSession.urlName}`}
										state={{
											navigationSource:
												GroupSessionDetailNavigationSource.GROUP_SESSION_COLLECTION,
										}}
									>
										<StudioEvent className="h-100" studioEvent={groupSession} />
									</Link>
								</Col>
							);
						})}
					</Row>
				) : (
					<Row>
						<Col>
							<NoData
								title="Upcoming Sessions"
								description="There are no group sessions available."
								actions={[]}
							/>
						</Col>
					</Row>
				)}
			</Container>
		</>
	);
};
