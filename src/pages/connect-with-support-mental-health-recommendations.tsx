import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { FeatureId, InstitutionFeature } from '@/lib/models';
import { accountService, screeningService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import NoData from '@/components/no-data';
import InlineAlert from '@/components/inline-alert';
import { PsychiatristRecommendation } from '@/components/psychiatrist-recommendation';

const ConnectWithSupportMentalHealthRecommendations = () => {
	const navigate = useNavigate();
	const { account, institution } = useAccount();
	const [completedAtDescription, setCompletedAtDescription] = useState('N/A');
	const [recommendedFeature, setRecommendedFeature] = useState<InstitutionFeature>();
	const [appointmentScheduledByFeatureId, setAppointmentScheduledByFeatureId] = useState<Record<string, boolean>>({});
	const [showPsychiatristRecommendation, setShowPsychiatristRecommendation] = useState(false);

	const hasScehduledPsychiatrist = !!appointmentScheduledByFeatureId[FeatureId.PSYCHIATRIST];

	const fetchData = useCallback(async () => {
		if (!account?.accountId) {
			throw new Error('accountId is undefined.');
		}

		if (!institution.providerTriageScreeningFlowId) {
			throw new Error('institution.providerTriageScreeningFlowId is undefined.');
		}

		const [
			{ sessionFullyCompleted, sessionFullyCompletedAtDescription },
			recommendationsResponse,
			{ myChartConnectionRequired },
		] = await Promise.all([
			screeningService
				.getScreeningFlowCompletionStatusByScreeningFlowId(institution.providerTriageScreeningFlowId)
				.fetch(),
			accountService.getRecommendedFeatures(account.accountId).fetch(),
			accountService.getBookingRequirements(account.accountId).fetch(),
		]);

		if (myChartConnectionRequired || !sessionFullyCompleted) {
			navigate('/connect-with-support/mental-health-providers', {
				replace: true,
			});
			return;
		}

		setAppointmentScheduledByFeatureId(recommendationsResponse.appointmentScheduledByFeatureId);
		const psychiatristIndex = recommendationsResponse.features.findIndex(
			(f) => f.featureId === FeatureId.PSYCHIATRIST
		);
		setShowPsychiatristRecommendation(psychiatristIndex > -1);

		const firstRecommendation = recommendationsResponse.features
			.filter((f) => f.featureId !== FeatureId.PSYCHIATRIST)
			.pop();
		const matchingInstitutionFeature = institution.features.find(
			(f) => f.featureId === firstRecommendation?.featureId
		);

		setCompletedAtDescription(sessionFullyCompletedAtDescription);
		setRecommendedFeature(matchingInstitutionFeature);
	}, [account?.accountId, institution.features, institution.providerTriageScreeningFlowId, navigate]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Connect with Support - Mental Health Recommendations</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<Container className="py-20">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							{recommendedFeature ? (
								<>
									<h1 className="mb-1">Assessment Results</h1>
									<p className="mb-6 fs-large text-gray">Completed {completedAtDescription}</p>
									<hr className="mb-8" />
									<p className="mb-6 fs-large">
										Based on the symptoms reported we recommend{' '}
										<strong>{recommendedFeature.treatmentDescription}</strong>.
									</p>
									<p className="mb-6 fs-large">
										You can schedule a telehealth appointment with one of the providers listed.
									</p>
									<div className="mb-8 text-center">
										<Button
											variant="primary"
											size="lg"
											onClick={() => {
												navigate(recommendedFeature.urlName);
											}}
										>
											Schedule an Appointment
										</Button>
									</div>

									{showPsychiatristRecommendation && !hasScehduledPsychiatrist && (
										<PsychiatristRecommendation />
									)}

									<InlineAlert
										variant="info"
										title="Your responses are not reviewed"
										description="If you are in crisis, you can contact the Crisis Line 24 hours a day by calling 988. If you have an urgent or life-threatening issue, call 911 or go to the nearest emergency room."
									/>
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
