import React, { useCallback, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';

import { MhicPatientOrderTable } from '@/components/integrated-care/mhic';
import { Container } from 'react-bootstrap';
import useFetchPatientOrders from '../hooks/use-fetch-patient-orders';
import { PatientOrderDispositionId } from '@/lib/models';
// import { MhicLayoutContext } from './mhic-layout';

const MhicSearchResults = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	// const { setMainViewRefresher } = useOutletContext<MhicLayoutContext>();

	const {
		fetchPatientOrders,
		isLoadingOrders,
		patientOrders = [],
		totalCount,
		totalCountDescription,
	} = useFetchPatientOrders();

	const pageNumber = searchParams.get('pageNumber') ?? '0';
	const patientMrn = searchParams.get('patientMrn');
	const searchQuery = searchParams.get('searchQuery');

	const fetchData = useCallback(() => {
		fetchPatientOrders({
			...(searchQuery && { searchQuery }),
			...(patientMrn && { patientMrn }),
			...(pageNumber && { pageNumber }),
			patientOrderDispositionId: [
				PatientOrderDispositionId.OPEN,
				PatientOrderDispositionId.CLOSED,
				PatientOrderDispositionId.ARCHIVED,
			],
		});
	}, [fetchPatientOrders, pageNumber, patientMrn, searchQuery]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// useEffect(() => {
	// 	setMainViewRefresher(() => fetchData);
	// }, [fetchData, setMainViewRefresher]);

	const handlePaginationClick = useCallback(
		(pageIndex: number) => {
			searchParams.set('pageNumber', String(pageIndex));
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	return (
		<Container fluid className="px-8">
			<div className="py-8">
				<h2>Search Results for "{patientMrn || searchQuery}" </h2>

				<p className="mb-0 text-gray fs-large fw-normal">
					{totalCountDescription} {totalCount === 1 ? 'Order' : 'Orders'}
				</p>
			</div>

			<MhicPatientOrderTable
				isLoading={isLoadingOrders}
				patientOrders={patientOrders}
				selectAll={false}
				totalPatientOrdersCount={totalCount}
				totalPatientOrdersDescription={totalCountDescription}
				pageNumber={parseInt(pageNumber, 10)}
				pageSize={15}
				onPaginationClick={handlePaginationClick}
				columnConfig={{
					patient: true,
					mrn: true,
					preferredPhone: true,
					practice: true,
					orderState: true,
					assignedMhic: true,
				}}
				coloredRows
			/>
		</Container>
	);
};

export default MhicSearchResults;