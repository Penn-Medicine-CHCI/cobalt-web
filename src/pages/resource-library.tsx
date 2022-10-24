import React, { useCallback, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import InputHelper from '@/components/input-helper';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import Carousel from '@/components/carousel';
import ResourceLibraryCard from '@/components/resource-library-card';

const carouselConfig = {
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
		items: 2,
		partialVisibilityGutter: 0,
	},
};

interface ResourceSubtopic {
	title: string;
	description: string;
	resources: Resource[];
}
interface Resource {
	new?: boolean;
	imageUrl?: string;
	subtopic: string;
	title: string;
	author: string;
	description: string;
	tags: ResourceTag[];
}
interface ResourceTag {
	tagId: string;
	description: string;
}

const ResourceLibrary = () => {
	const [searchInputValue, setSearchInputValue] = useState('');
	const [resourceSubtopics] = useState<ResourceSubtopic[]>([
		{
			title: 'Symptoms',
			description:
				'Browse content tailored to symptoms you or others in your life may be experiencing, including concerns about mood, anxiety, sleep, fatigue or substance abuse.',
			resources: [
				{
					new: true,
					subtopic: 'Symptoms',
					title: 'This is the Title of the Content',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [
						{
							tagId: 'MOOD',
							description: 'Mood',
						},
						{
							tagId: 'ANXIETY',
							description: 'Anxiety',
						},
					],
				},
				{
					subtopic: 'Symptoms',
					title: 'This is a title that has multiple lines. It can run on to two lines, but not more than that. Two is the maximum line length that titles can have.',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [
						{
							tagId: 'SLEEP',
							description: 'Sleep',
						},
						{
							tagId: 'SUBSTANCE_USE',
							description: 'Substance Use',
						},
					],
				},
				{
					new: true,
					subtopic: 'Symptoms',
					title: 'This is the Title of the Content',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [
						{
							tagId: 'MOOD',
							description: 'Mood',
						},
						{
							tagId: 'ANXIETY',
							description: 'Anxiety',
						},
					],
				},
			],
		},
	]);

	const fetchData = useCallback(() => {
		return null;
	}, []);

	return (
		<AsyncPage fetchData={fetchData}>
			<HeroContainer className="bg-n75">
				<h1 className="mb-4 text-center">Resource Library</h1>
				<p className="mb-6 text-center fs-large">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Magna aliquam lacus, mattis sem volutpat
					rhoncus massa.
				</p>
				<InputHelper
					type="search"
					label="Search Resources"
					value={searchInputValue}
					onChange={({ currentTarget }) => {
						setSearchInputValue(currentTarget.value);
					}}
				/>
			</HeroContainer>
			<Container className="pt-16 pb-32">
				{resourceSubtopics.map((subtopic) => {
					return (
						<Row>
							<Col lg={3}>
								<ResourceLibrarySubtopicCard
									className="h-100"
									title={subtopic.title}
									description={subtopic.description}
								/>
							</Col>
							<Col lg={9}>
								<Carousel responsive={carouselConfig} trackStyles={{ paddingTop: 0, paddingBottom: 0 }}>
									{subtopic.resources.map((resource) => {
										return (
											<ResourceLibraryCard
												className="h-100"
												badgeTitle={resource.new ? 'New' : ''}
												subtopic={resource.subtopic}
												title={resource.title}
												author={resource.author}
												description={resource.description}
												tags={resource.tags}
											/>
										);
									})}
								</Carousel>
							</Col>
						</Row>
					);
				})}
			</Container>
		</AsyncPage>
	);
};

export default ResourceLibrary;
