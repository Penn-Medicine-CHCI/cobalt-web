import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';
import { Helmet } from 'react-helmet';

import {
	CallToActionModel,
	CALL_TO_ACTION_DISPLAY_AREA_ID,
	ContentDuration,
	ContentType,
	TagGroup,
	Content,
	Tag,
	AnalyticsNativeEventTypeId,
} from '@/lib/models';
import { analyticsService, callToActionService, resourceLibraryService, screeningService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useAnalytics from '@/hooks/use-analytics';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import Carousel from '@/components/carousel';
import ResourceLibraryCard from '@/components/resource-library-card';
import InputHelperSearch from '@/components/input-helper-search';
import FloatingActionButton from '@/components/floating-action-button';
import CallToAction from '@/components/call-to-action';
import TabBar from '@/components/tab-bar';
import SimpleFilter from '@/components/simple-filter';
import { AddOrRemoveValueFromArray } from '@/lib/utils/form-utils';
import ScreeningFlowCta from '@/components/screening-flow-cta';

export const resourceLibraryCarouselConfig = {
	externalMonitor: {
		breakpoint: { max: 3000, min: 1201 },
		items: 2,
		partialVisibilityGutter: 60,
	},
	desktopExtraLarge: {
		breakpoint: { max: 1200, min: 993 },
		items: 2,
		partialVisibilityGutter: 40,
	},
	desktop: {
		breakpoint: { max: 992, min: 769 },
		items: 2,
		partialVisibilityGutter: 0,
	},
	tablet: {
		breakpoint: { max: 768, min: 575 },
		items: 2,
		partialVisibilityGutter: 0,
	},
	mobile: {
		breakpoint: { max: 575, min: 0 },
		items: 1,
		partialVisibilityGutter: 0,
	},
};

const ResourceLibrary = () => {
	const { mixpanel } = useAnalytics();
	const { institution } = useAccount();

	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = useMemo(() => searchParams.get('searchQuery') ?? '', [searchParams]);
	const recommendedContent = useMemo(() => searchParams.get('recommended') === 'true', [searchParams]);
	const tagIdQuery = useMemo(() => searchParams.getAll('tagId'), [searchParams]);
	const contentTypeIdQuery = useMemo(() => searchParams.getAll('contentTypeId'), [searchParams]);
	const contentDurationIdQuery = useMemo(() => searchParams.getAll('contentDurationId'), [searchParams]);

	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);

	const [hasCompletedScreening, setHasCompletedScreening] = useState(false);
	const [callsToAction, setCallsToAction] = useState<CallToActionModel[]>([]);
	const [searchInputValue, setSearchInputValue] = useState('');
	const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
	const [contents, setContents] = useState<Content[]>([]);
	const [findResultTotalCount, setFindResultTotalCount] = useState(0);
	const [findResultTotalCountDescription, setFindResultTotalCountDescription] = useState('');
	const [contentsByTagGroupId, setContentsByTagGroupId] = useState<Record<string, Content[]>>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, Tag>>();
	// Topic Filter
	const [tagGroupFilters, setTagGroupFilters] = useState<TagGroup[]>([]);
	const [tagFilters, setTagFilters] = useState<Record<string, Tag[]>>();
	const [tagFilterIsShowing, setTagFilterIsShowing] = useState(false);
	const [tagFilterValue, setTagFilterValue] = useState<string[]>([]);
	// Content Type Filter
	const [contentTypeFilters, setContentTypeFilters] = useState<ContentType[]>([]);
	const [contentTypeFilterIsShowing, setContentTypeFilterIsShowing] = useState(false);
	const [contentTypeFilterValue, setContentTypeFilterValue] = useState<string[]>([]);
	// Content Duration Filter
	const [contentDurationFilters, setContentDurationFilters] = useState<ContentDuration[]>([]);
	const [contentDurationFilterIsShowing, setContentDurationFilterIsShowing] = useState(false);
	const [contentDurationFilterValue, setContentDurationFilterValue] = useState<string[]>([]);
	const hasFilterQueryParms = useMemo(
		() => tagIdQuery.length > 0 || contentTypeIdQuery.length > 0 || contentDurationIdQuery.length > 0,
		[contentDurationIdQuery.length, contentTypeIdQuery.length, tagIdQuery.length]
	);

	useEffect(() => {
		if (!hasTouchScreen) {
			searchInputRef.current?.focus({ preventScroll: true });
		}
	}, [hasTouchScreen]);

	const fetchCallsToAction = useCallback(async () => {
		const response = await callToActionService
			.getCallsToAction({ callToActionDisplayAreaId: CALL_TO_ACTION_DISPLAY_AREA_ID.CONTENT_LIST })
			.fetch();

		setCallsToAction(response.callsToAction);
	}, []);

	const fetchRecommendedFilters = useCallback(async () => {
		const response = await resourceLibraryService
			.getResourceLibraryRecommendedContent({ pageNumber: 0, pageSize: 0 })
			.fetch();

		const tagsByTagGroupId: Record<string, Tag[]> = {};
		Object.values(response.tagsByTagId).forEach((tag) => {
			if (tagsByTagGroupId[tag.tagGroupId]) {
				tagsByTagGroupId[tag.tagGroupId].push(tag);
			} else {
				tagsByTagGroupId[tag.tagGroupId] = [tag];
			}
		});

		setTagGroupFilters(response.tagGroups);
		setTagFilters(tagsByTagGroupId);
		setContentTypeFilters(response.contentTypes);
		setContentDurationFilters(response.contentDurations);
	}, []);

	useEffect(() => {
		setTagFilterValue(tagIdQuery);
	}, [tagIdQuery]);

	useEffect(() => {
		setContentTypeFilterValue(contentTypeIdQuery);
	}, [contentTypeIdQuery]);

	useEffect(() => {
		setContentDurationFilterValue(contentDurationIdQuery);
	}, [contentDurationIdQuery]);

	const checkScreenFlowStatus = useCallback(async () => {
		if (!institution?.contentScreeningFlowId) {
			return;
		}

		const { sessionFullyCompleted } = await screeningService
			.getScreeningFlowCompletionStatusByScreeningFlowId(institution.contentScreeningFlowId)
			.fetch();

		if (sessionFullyCompleted) {
			setHasCompletedScreening(true);
		} else {
			setHasCompletedScreening(false);
		}
	}, [institution?.contentScreeningFlowId]);

	const fetchData = useCallback(async () => {
		if (searchQuery) {
			setSearchInputValue(searchQuery);

			const searchResponse = await resourceLibraryService
				.searchResourceLibrary({ searchQuery, pageNumber: 0, pageSize: 100 })
				.fetch();

			setContents(searchResponse.findResult.contents);
			setFindResultTotalCount(searchResponse.findResult.totalCount);
			setFindResultTotalCountDescription(searchResponse.findResult.totalCountDescription);
			setTagGroups([]);
			setContentsByTagGroupId(undefined);
			setTagsByTagId(searchResponse.tagsByTagId);

			analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_RESOURCE_LIBRARY, {
				mode: 'SEARCH',
				searchQuery: searchQuery,
				totalCount: searchResponse.findResult.totalCount,
			});

			return;
		}

		if (recommendedContent) {
			const recommendedResponse = await resourceLibraryService
				.getResourceLibraryRecommendedContent({
					pageNumber: 0,
					pageSize: 100,
					tagId: tagIdQuery,
					contentTypeId: contentTypeIdQuery,
					contentDurationId: contentDurationIdQuery,
				})
				.fetch();

			setContents(recommendedResponse.findResult.contents);
			setFindResultTotalCount(0);
			setFindResultTotalCountDescription('');
			setTagGroups([]);
			setContentsByTagGroupId(undefined);
			setTagsByTagId(recommendedResponse.tagsByTagId);

			analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_RESOURCE_LIBRARY, {
				mode: 'RECOMMENDED',
				totalCount: recommendedResponse.findResult.totalCount,
			});

			return;
		}

		const response = await resourceLibraryService.getResourceLibrary().fetch();

		setContents([]);
		setFindResultTotalCount(0);
		setFindResultTotalCountDescription('');
		setTagGroups(response.tagGroups);
		setContentsByTagGroupId(response.contentsByTagGroupId);
		setTagsByTagId(response.tagsByTagId);

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_RESOURCE_LIBRARY, {
			mode: 'DEFAULT',
		});
	}, [contentDurationIdQuery, contentTypeIdQuery, recommendedContent, searchQuery, tagIdQuery]);

	const applyRecommendedFilterValuesToSearchParam = (values: string[], searchParam: string) => {
		searchParams.delete(searchParam);

		for (const value of values) {
			searchParams.append(searchParam, value);
		}

		setSearchParams(searchParams, { replace: true });
	};

	const handleClearRecommendedFiltersButtonClick = useCallback(() => {
		searchParams.delete('searchQuery');
		searchParams.delete('tagId');
		searchParams.delete('contentTypeId');
		searchParams.delete('contentDurationId');

		setSearchParams(searchParams, { replace: true });
	}, [searchParams, setSearchParams]);

	const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		searchParams.delete('recommended');
		searchParams.delete('tagId');
		searchParams.delete('contentTypeId');
		searchParams.delete('contentDurationId');

		if (searchInputValue) {
			searchParams.set('searchQuery', searchInputValue);
		} else {
			searchParams.delete('searchQuery');
		}

		setSearchParams(searchParams, { replace: true });

		if (hasTouchScreen) {
			searchInputRef.current?.blur();
		}
	};

	const clearSearch = useCallback(() => {
		setSearchInputValue('');

		searchParams.delete('searchQuery');
		searchParams.delete('tagId');
		searchParams.delete('contentTypeId');
		searchParams.delete('contentDurationId');
		setSearchParams(searchParams, { replace: true });

		if (!hasTouchScreen) {
			searchInputRef.current?.focus({ preventScroll: true });
		}
	}, [hasTouchScreen, searchParams, setSearchParams]);

	const handleKeydown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== 'Escape') {
				return;
			}

			clearSearch();
		},
		[clearSearch]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeydown, false);

		return () => {
			document.removeEventListener('keydown', handleKeydown, false);
		};
	}, [handleKeydown]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Resource Library</title>
			</Helmet>

			<HeroContainer className="bg-n75">
				<h1 className="mb-4 text-center">Resource Library</h1>
				<p className="mb-6 text-center fs-large">
					A variety of self-directed digital resources, including articles, podcasts, apps, videos, worksheets
					and more, that help support general wellness and mental health education.
				</p>
				<Form onSubmit={handleSearchFormSubmit}>
					<InputHelperSearch
						ref={searchInputRef}
						placeholder="Search Resources"
						value={searchInputValue}
						onChange={({ currentTarget }) => {
							setSearchInputValue(currentTarget.value);
						}}
						onClear={clearSearch}
					/>
				</Form>
			</HeroContainer>

			<AsyncPage fetchData={fetchCallsToAction}>
				{callsToAction.length > 0 && (
					<Container className="pt-16">
						<Row>
							<Col>
								{callsToAction.map((cta, index) => {
									const isLast = callsToAction.length - 1 === index;
									return (
										<CallToAction
											key={`cta-${index}`}
											className={!isLast ? 'mb-4' : ''}
											callToAction={cta}
										/>
									);
								})}
							</Col>
						</Row>
					</Container>
				)}
			</AsyncPage>

			{institution?.userSubmittedContentEnabled && (
				<FloatingActionButton
					onClick={() => {
						mixpanel.track('Patient-Sourced Add Content Click', {});
						navigate('/cms/on-your-time/create');
					}}
				/>
			)}

			{searchQuery ? (
				<AsyncPage fetchData={fetchData}>
					<Container className="pt-5 pt-lg-6 pb-6 pb-lg-32">
						<Row className="pt-4 mb-10">
							<h3 className="mb-0">
								{findResultTotalCountDescription} result{findResultTotalCount === 1 ? '' : 's'}
							</h3>
						</Row>
						<Row>
							{contents.map((content, resourceIndex) => {
								return (
									<Col key={resourceIndex} xs={12} md={6} lg={4} className="mb-8">
										<ResourceLibraryCard
											linkTo={`/resource-library/${content.contentId}`}
											className="h-100"
											imageUrl={content.imageUrl}
											badgeTitle={content.newFlag ? 'New' : ''}
											title={content.title}
											author={content.author}
											description={content.description}
											tags={
												tagsByTagId
													? content.tagIds.map((tagId) => {
															return tagsByTagId[tagId];
													  })
													: []
											}
											contentTypeId={content.contentTypeId}
											duration={content.durationInMinutesDescription}
										/>
									</Col>
								);
							})}
						</Row>
					</Container>
				</AsyncPage>
			) : (
				<Container
					className={classNames({
						'pt-6': institution?.recommendedContentEnabled,
						'pt-12': !institution?.recommendedContentEnabled,
					})}
				>
					{institution?.recommendedContentEnabled && (
						<Row className="mb-6">
							<Col>
								<TabBar
									key="resource-library-tabbar"
									value={recommendedContent ? 'FOR_YOU' : 'ALL'}
									tabs={[
										{ value: 'ALL', title: 'All' },
										{ value: 'FOR_YOU', title: 'For You' },
									]}
									onTabClick={(value) => {
										searchParams.delete('searchQuery');
										searchParams.delete('tagId');
										searchParams.delete('contentTypeId');
										searchParams.delete('contentDurationId');

										if (value === 'ALL') {
											searchParams.delete('recommended');
										} else {
											searchParams.set('recommended', 'true');
										}

										setHasCompletedScreening(false);
										setSearchParams(searchParams, { replace: true });
									}}
								/>
							</Col>
						</Row>
					)}
					{recommendedContent ? (
						<AsyncPage fetchData={checkScreenFlowStatus}>
							{!hasCompletedScreening ? (
								<Row>
									<Col>
										<ScreeningFlowCta className="bg-n75 border-0" buttonVariant="outline-primary" />
									</Col>
								</Row>
							) : (
								<>
									<AsyncPage fetchData={fetchRecommendedFilters}>
										<Row className="pb-6">
											<Col>
												<SimpleFilter
													title="Topic"
													className="me-2"
													dialogWidth={628}
													show={tagFilterIsShowing}
													activeLength={searchParams.getAll('tagId').length}
													onHide={() => {
														setTagFilterIsShowing(false);
													}}
													onClick={() => {
														setTagFilterIsShowing(true);
													}}
													onClear={() => {
														setTagFilterIsShowing(false);
														applyRecommendedFilterValuesToSearchParam([], 'tagId');
													}}
													onApply={() => {
														setTagFilterIsShowing(false);
														applyRecommendedFilterValuesToSearchParam(
															tagFilterValue,
															'tagId'
														);
													}}
												>
													{tagGroupFilters.map((tagGroup, tagGroupIndex) => {
														const isLastTagGroup =
															tagGroupFilters.length - 1 === tagGroupIndex;

														return (
															<div
																key={tagGroup.tagGroupId}
																className={classNames({
																	'mb-5 border-bottom': !isLastTagGroup,
																})}
															>
																<h5 className="mb-4">{tagGroup.name}</h5>
																{tagFilters?.[tagGroup.tagGroupId]?.map(
																	(tag, tagIndex) => {
																		const isLastTag =
																			tagFilters[tagGroup.tagGroupId].length -
																				1 ===
																			tagIndex;

																		return (
																			<Form.Check
																				key={tag.tagId}
																				className={classNames({
																					'mb-0': isLastTagGroup && isLastTag,
																					'mb-5':
																						!isLastTagGroup && isLastTag,
																					'mb-1': !isLastTag,
																				})}
																				type="checkbox"
																				name={`tag-group--${tag.tagGroupId}`}
																				id={`tag--${tag.tagId}`}
																				label={tag.name}
																				value={tag.tagId}
																				checked={tagFilterValue.includes(
																					tag.tagId
																				)}
																				onChange={({ currentTarget }) => {
																					const updatedArray =
																						AddOrRemoveValueFromArray(
																							currentTarget.value,
																							tagFilterValue
																						);

																					setTagFilterValue(updatedArray);
																				}}
																			/>
																		);
																	}
																)}
															</div>
														);
													})}
												</SimpleFilter>
												<SimpleFilter
													title="Type"
													className="me-2"
													show={contentTypeFilterIsShowing}
													activeLength={searchParams.getAll('contentTypeId').length}
													onHide={() => {
														setContentTypeFilterIsShowing(false);
													}}
													onClick={() => {
														setContentTypeFilterIsShowing(true);
													}}
													onClear={() => {
														setContentTypeFilterIsShowing(false);
														applyRecommendedFilterValuesToSearchParam([], 'contentTypeId');
													}}
													onApply={() => {
														setContentTypeFilterIsShowing(false);
														applyRecommendedFilterValuesToSearchParam(
															contentTypeFilterValue,
															'contentTypeId'
														);
													}}
												>
													{contentTypeFilters.map((contentType) => {
														return (
															<Form.Check
																key={contentType.contentTypeId}
																type="checkbox"
																name="CONTENT_TYPES"
																id={contentType.contentTypeId}
																label={contentType.description}
																value={contentType.contentTypeId}
																checked={contentTypeFilterValue.includes(
																	contentType.contentTypeId
																)}
																onChange={({ currentTarget }) => {
																	const updatedArray = AddOrRemoveValueFromArray(
																		currentTarget.value,
																		contentTypeFilterValue
																	);

																	setContentTypeFilterValue(updatedArray);
																}}
															/>
														);
													})}
												</SimpleFilter>
												<SimpleFilter
													title="Length"
													show={contentDurationFilterIsShowing}
													activeLength={searchParams.getAll('contentDurationId').length}
													onHide={() => {
														setContentDurationFilterIsShowing(false);
													}}
													onClick={() => {
														setContentDurationFilterIsShowing(true);
													}}
													onClear={() => {
														setContentDurationFilterIsShowing(false);
														applyRecommendedFilterValuesToSearchParam(
															[],
															'contentDurationId'
														);
													}}
													onApply={() => {
														setContentDurationFilterIsShowing(false);
														applyRecommendedFilterValuesToSearchParam(
															contentDurationFilterValue,
															'contentDurationId'
														);
													}}
												>
													{contentDurationFilters.map((contentDuration) => {
														return (
															<Form.Check
																key={contentDuration.contentDurationId}
																type="checkbox"
																name="CONTENT_TYPES"
																id={contentDuration.contentDurationId}
																label={contentDuration.description}
																value={contentDuration.contentDurationId}
																checked={contentDurationFilterValue.includes(
																	contentDuration.contentDurationId
																)}
																onChange={({ currentTarget }) => {
																	const updatedArray = AddOrRemoveValueFromArray(
																		currentTarget.value,
																		contentDurationFilterValue
																	);

																	setContentDurationFilterValue(updatedArray);
																}}
															/>
														);
													})}
												</SimpleFilter>
												{hasFilterQueryParms && (
													<Button
														variant="link"
														className="p-0 mx-3"
														onClick={handleClearRecommendedFiltersButtonClick}
													>
														Clear
													</Button>
												)}
											</Col>
										</Row>
									</AsyncPage>
									<AsyncPage fetchData={fetchData}>
										{contents.length <= 0 ? (
											<>
												{hasFilterQueryParms ? (
													<Row className="pt-12 pb-24">
														<Col>
															<h2 className="mb-6 text-muted text-center">No Results</h2>
															<p className="mb-6 fs-large text-muted text-center">
																Try adjusting your filters to see available content
															</p>
															<div className="text-center">
																<Button
																	size="lg"
																	variant="outline-primary"
																	onClick={handleClearRecommendedFiltersButtonClick}
																>
																	Clear Filters
																</Button>
															</div>
														</Col>
													</Row>
												) : (
													<Row className="mb-24">
														<Col>
															<div className="bg-n75 rounded p-12">
																<Row>
																	<Col lg={{ span: 6, offset: 3 }}>
																		<h2 className="mb-6 text-muted text-center">
																			No recommendations at this time
																		</h2>
																		<p className="mb-0 fs-large text-muted text-center">
																			We are continually adding more resources to
																			the library. In the meantime, you can browse
																			resources related to{' '}
																			<Link to="/resource-library/tag-groups/symptoms">
																				Symptoms
																			</Link>
																			,{' '}
																			<Link to="/resource-library/tag-groups/work-life">
																				Work Life
																			</Link>
																			,{' '}
																			<Link to="/resource-library/tag-groups/personal-life">
																				Personal Life
																			</Link>
																			,{' '}
																			<Link to="/resource-library/tag-groups/identity">
																				Identity
																			</Link>
																			,{' '}
																			<Link to="/resource-library/tag-groups/caretaking">
																				Caretaking
																			</Link>
																			, and{' '}
																			<Link to="/resource-library/tag-groups/world-events">
																				World Events
																			</Link>
																		</p>
																	</Col>
																</Row>
															</div>
														</Col>
													</Row>
												)}
											</>
										) : (
											<Row>
												{contents.map((content, resourceIndex) => {
													return (
														<Col key={resourceIndex} xs={12} md={6} lg={4} className="mb-8">
															<ResourceLibraryCard
																linkTo={`/resource-library/${content.contentId}`}
																className="h-100"
																imageUrl={content.imageUrl}
																badgeTitle={content.newFlag ? 'New' : ''}
																title={content.title}
																author={content.author}
																description={content.description}
																tags={
																	tagsByTagId
																		? content.tagIds.map((tagId) => {
																				return tagsByTagId[tagId];
																		  })
																		: []
																}
																contentTypeId={content.contentTypeId}
																duration={content.durationInMinutesDescription}
															/>
														</Col>
													);
												})}
											</Row>
										)}
									</AsyncPage>
								</>
							)}
						</AsyncPage>
					) : (
						<AsyncPage fetchData={fetchData}>
							{tagGroups.map((tagGroup) => {
								return (
									<Row key={tagGroup.tagGroupId} className="mb-11 mb-lg-18">
										<Col lg={3} className="mb-10 mb-lg-0 pt-4 pb-2">
											<ResourceLibrarySubtopicCard
												className="h-100"
												colorId={tagGroup.colorId}
												title={tagGroup.name}
												description={tagGroup.description}
												to={`/resource-library/tag-groups/${tagGroup.urlName}`}
											/>
										</Col>
										<Col lg={9}>
											<Carousel
												responsive={resourceLibraryCarouselConfig}
												trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
												floatingButtonGroup
											>
												{contentsByTagGroupId?.[tagGroup.tagGroupId]?.map((content) => {
													return (
														<ResourceLibraryCard
															key={content.contentId}
															linkTo={`/resource-library/${content.contentId}`}
															className="h-100"
															imageUrl={content.imageUrl}
															badgeTitle={content.newFlag ? 'New' : ''}
															title={content.title}
															author={content.author}
															description={content.description}
															tags={
																tagsByTagId
																	? content.tagIds.map((tagId) => {
																			return tagsByTagId[tagId];
																	  })
																	: []
															}
															contentTypeId={content.contentTypeId}
															duration={content.durationInMinutesDescription}
														/>
													);
												})}
											</Carousel>
										</Col>
									</Row>
								);
							})}
						</AsyncPage>
					)}
				</Container>
			)}
		</>
	);
};

export default ResourceLibrary;
