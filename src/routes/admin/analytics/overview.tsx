import { ChartCard } from '@/components/admin';
import { PieChart } from '@/components/pie-chart';
import { random } from 'lodash';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Await, LoaderFunctionArgs, defer, useRouteLoaderData } from 'react-router-dom';

interface AdminAnalyticsOverviewLoaderData {
	overviewPromise: Promise<{
		totalVisits: {
			legend: string;
			count: number;
		}[];
		totalUsers: {
			legend: string;
			count: number;
		}[];
		totalEmployers: {
			legend: string;
			count: number;
		}[];
	}>;
}

export function useAdminAnalyticsOverviewLoaderData() {
	return useRouteLoaderData('admin-analytics-overview') as AdminAnalyticsOverviewLoaderData;
}

export async function loader({ request }: LoaderFunctionArgs) {
	// const url = new URL(request.url);

	const overviewPromise = new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				totalVisits: [
					{
						legend: 'New',
						count: random(432, 5678),
					},
					{
						legend: 'Returning',
						count: random(432, 5678),
					},
				],
				totalUsers: [
					{
						legend: 'Logged in',
						count: random(432, 5678),
					},
					{
						legend: 'Anonymous',
						count: random(432, 5678),
					},
				],
				totalEmployers: [
					{
						legend: 'Employer 1',
						count: random(432, 5678),
					},
					{
						legend: 'Employer 2',
						count: random(432, 5678),
					},
					{
						legend: 'Employer 3',
						count: random(432, 5678),
					},
					{
						legend: 'Employer 4',
						count: random(432, 5678),
					},
					{
						legend: 'Employer 5',
						count: random(432, 5678),
					},
				],
			} as Awaited<AdminAnalyticsOverviewLoaderData['overviewPromise']>);
		}, 100);
	});

	return defer({
		overviewPromise,
	});
}

export const Component = () => {
	const { overviewPromise } = useAdminAnalyticsOverviewLoaderData() as AdminAnalyticsOverviewLoaderData;

	return (
		<Await resolve={overviewPromise}>
			{(data: Awaited<AdminAnalyticsOverviewLoaderData['overviewPromise']>) => {
				const totalVisits = data.totalVisits.reduce((acc, tV) => tV.count + acc, 0);
				const totalUsers = data.totalUsers.reduce((acc, tV) => tV.count + acc, 0);
				const totalEmployers = data.totalEmployers.reduce((acc, tV) => tV.count + acc, 0);

				return (
					<Row>
						<Col xs={12} sm={6} md={4}>
							<ChartCard
								title="Visits"
								total={totalVisits}
								subTitle="Total"
								chart={<PieChart label="Visits" data={data.totalVisits} />}
							/>
						</Col>

						<Col xs={12} sm={6} md={4}>
							<ChartCard
								title="Users"
								total={totalUsers}
								subTitle="Total"
								chart={<PieChart label="Users" data={data.totalUsers} />}
							/>
						</Col>

						<Col xs={12} sm={6} md={4}>
							<ChartCard
								title="Employers"
								total={totalEmployers}
								subTitle={`Across ${data.totalEmployers.length} Employers`}
								chart={<PieChart label="Employer" data={data.totalEmployers} />}
							/>
						</Col>
					</Row>
				);
			}}
		</Await>
	);
};
