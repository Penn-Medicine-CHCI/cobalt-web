import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { AccountSupportRole } from '@/lib/models';
import { accountService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import NoData from '@/components/no-data';
import { useBookingRequirementsNavigation } from '@/hooks/use-booking-requirements-navigation';

const ConnectWithSupportMentalHealthRecommendations = () => {
	const navigate = useNavigate();
	const checkBookingRequirementsAndRedirect = useBookingRequirementsNavigation();
	const { account, institution } = useAccount();
	const [supportRoles, setSupportRoles] = useState<AccountSupportRole[]>([]);

	const fetchData = useCallback(async () => {
		if (!account?.accountId) {
			throw new Error('accountId is undefined.');
		}

		const response = await accountService.getRecommendedSupportRoles(account.accountId).fetch();
		setSupportRoles(response.supportRoles);
	}, [account?.accountId]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Connect with Support - Mental Health Recommendations</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<Container className="py-20">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							{supportRoles.length > 0 ? (
								<>
									<h1 className="mb-1">Assessment Results</h1>
									<p className="mb-6 fs-large text-gray">Completed XXX</p>
									<hr className="mb-8" />
									<p className="mb-6 fs-large">
										Based on the symptoms reported we recommend that you meet with a{' '}
										<strong>{supportRoles[0]?.description}</strong>
									</p>
									<p className="mb-6 fs-large">
										You can <strong>schedule a telehealth appointment</strong> with a Mental health
										Provider by browsing the list of providers and choosing an available appointment
										time. If you need an in-person appointment, please call us at{' '}
										<a href={`tel:${institution.clinicalSupportPhoneNumber}`}>
											{institution.clinicalSupportPhoneNumberDescription ?? 'N/A'}
										</a>
									</p>
									<div className="text-center">
										<Button
											variant="primary"
											size="lg"
											onClick={checkBookingRequirementsAndRedirect}
										>
											Connect to {institution.myChartName}
										</Button>
									</div>
								</>
							) : (
								<NoData
									title="No Support Roles Found"
									description="Copy TBD"
									actions={[
										{
											variant: 'primary',
											title: 'Return Home',
											onClick: () => {
												navigate('/');
											},
										},
									]}
								/>
							)}
						</Col>
					</Row>
				</Container>
			</AsyncWrapper>
		</>
	);
};

export default ConnectWithSupportMentalHealthRecommendations;
