import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import AsyncWrapper from '@/components/async-page';
import { ScreeningIntro } from '@/components/integrated-care/common';
import { PatientOrderModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';

const PatientDemographicsIntroduction = () => {
	const navigate = useNavigate();
	const [patientOrder, setPatientOrder] = useState<PatientOrderModel>();

	const fetchData = useCallback(async () => {
		const response = await integratedCareService.getOpenOrderForCurrentPatient().fetch();
		setPatientOrder(response.patientOrder);
	}, []);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Introduction</title>
			</Helmet>

			<AsyncWrapper fetchData={fetchData}>
				<ScreeningIntro
					patientOrder={patientOrder}
					onBegin={() => {
						navigate('/ic/patient/demographics-part-1');
					}}
				/>
			</AsyncWrapper>
		</>
	);
};

export default PatientDemographicsIntroduction;
