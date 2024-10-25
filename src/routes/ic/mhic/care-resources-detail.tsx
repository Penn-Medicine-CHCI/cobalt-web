import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { careResourceService } from '@/lib/services';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import { MhicCareResourceFormModal } from '@/components/integrated-care/mhic';
import { ReactComponent as EditIcon } from '@/assets/icons/icon-edit.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import NoData from '@/components/no-data';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const { careResourceId } = params;
	if (!careResourceId) {
		throw new Error('careResourceId is undefined.');
	}

	const networkCall = careResourceService.getCareResource(careResourceId);
	request.signal.addEventListener('abort', () => {
		networkCall.abort();
	});

	const { careResource } = await networkCall.fetch();
	return { careResource };
};

export const Component = () => {
	const { careResource } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const navigate = useNavigate();
	const revalidator = useRevalidator();
	const [showFormModal, setShowFormModal] = useState(false);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Resource - {careResource.name}</title>
			</Helmet>

			<MhicCareResourceFormModal
				careResourceId={careResource.careResourceId}
				show={showFormModal}
				onHide={() => {
					setShowFormModal(false);
				}}
				onSave={() => {
					revalidator.revalidate();
					setShowFormModal(false);
				}}
			/>

			<Container>
				<Row className="py-10">
					<Col>
						<Link to="/ic/mhic/admin/resources" className="d-block mb-6">
							Resources
						</Link>
						<h2 className="mb-0">{careResource.name}</h2>
					</Col>
				</Row>
				<Row>
					<Col lg={4}>
						<Card bsPrefix="ic-card">
							<Card.Body className="cobalt-card__body--top d-flex align-items-center justify-content-between">
								<h4>Details</h4>
								<Button
									variant="outline-primary"
									className="d-flex align-items-center"
									onClick={() => {
										setShowFormModal(true);
									}}
								>
									<EditIcon width={20} height={20} className="d-flex me-2" />
									Edit
								</Button>
							</Card.Body>
							<Card.Header className="cobalt-card__header--mid">
								<Card.Title>Contact</Card.Title>
							</Card.Header>
							<Card.Body>
								<Container fluid>
									<Row className="mb-4">
										<Col xs={3}>
											<p className="m-0 text-gray">Phone</p>
										</Col>
										<Col xs={9}>
											<p className="m-0">{careResource.formattedPhoneNumber ?? 'Not provided'}</p>
										</Col>
									</Row>
									<Row className="mb-4">
										<Col xs={3}>
											<p className="m-0 text-gray">Email</p>
										</Col>
										<Col xs={9}>
											<p className="m-0">{careResource.emailAddress ?? 'Not provided'}</p>
										</Col>
									</Row>
									<Row>
										<Col xs={3}>
											<p className="m-0 text-gray">Website</p>
										</Col>
										<Col xs={9}>
											<p className="m-0">{careResource.websiteUrl ?? 'Not provided'}</p>
										</Col>
									</Row>
								</Container>
							</Card.Body>
							<Card.Header className="cobalt-card__header--mid">
								<Card.Title>Accepted Insurance</Card.Title>
							</Card.Header>
							<Card.Body>
								<p className="m-0">
									{careResource.payors.length > 0
										? careResource.payors.map((p) => p.name).join(', ')
										: 'Not provided'}
								</p>
							</Card.Body>
							<Card.Header className="cobalt-card__header--mid">
								<Card.Title>Resource Notes</Card.Title>
							</Card.Header>
							<Card.Body>
								<p className="m-0">{careResource.notes ?? 'Not provided'}</p>
							</Card.Body>
						</Card>
					</Col>
					<Col lg={8}>
						<Card bsPrefix="ic-card">
							<Card.Body className="cobalt-card__body--top d-flex align-items-center justify-content-between">
								<h4>Locations</h4>
								<Button
									variant="primary"
									className="d-flex align-items-center"
									onClick={() => {
										navigate(`./add-location`);
									}}
								>
									<PlusIcon width={20} height={20} className="d-flex me-2" />
									Add
								</Button>
							</Card.Body>
							<Card.Body className="p-0 border-top bg-n75">
								<Table className="border-0">
									<TableHead>
										<TableRow>
											<TableCell header>Location Name</TableCell>
											<TableCell header>Insurance</TableCell>
											<TableCell header>Specialties</TableCell>
											<TableCell header>Status</TableCell>
											<TableCell header />
										</TableRow>
									</TableHead>
									<TableBody>
										{careResource.careResourceLocations.length === 0 && (
											<TableRow>
												<TableCell colSpan={5}>
													<NoData
														className="bg-white border-0"
														title="No Care Resource Locations"
														actions={[]}
													/>
												</TableCell>
											</TableRow>
										)}
										{careResource.careResourceLocations.map((crl) => (
											<TableRow>
												<TableCell>
													<span className="d-block text-nowrap">{crl.name}</span>
													<span className="d-block text-nowrap">
														{crl.address.streetAddress1}
													</span>
													<span className="d-block text-nowrap">
														{crl.address.locality}, {crl.address.region}{' '}
														{crl.address.postalCode}
													</span>
													{crl.address.streetAddress2 ?? (
														<span className="d-block text-nowrap">
															{crl.address.streetAddress2}
														</span>
													)}
												</TableCell>
												<TableCell>{crl.payors.map((p) => p.name).join(', ')}</TableCell>
												<TableCell>{crl.specialties.map((s) => s.name).join(', ')}</TableCell>
												<TableCell>
													<div className="d-flex align-items-center justify-content-between">
														{crl.acceptingNewPatients ? (
															<Badge pill bg="outline-success">
																Available
															</Badge>
														) : (
															<Badge pill bg="outline-danger">
																Unavailable
															</Badge>
														)}
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
		</>
	);
};
