import React, { FC, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';

import { InteractionInstance, InteractionOption, InteractionOptionAction } from '@/lib/models';
import { interactionService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';

const InteractionInstances: FC = () => {
	const handleError = useHandleError();
	const { interactionId } = useParams<{ interactionId: string }>();
	const [interactionInstance, setInteractionInstance] = useState<InteractionInstance>();
	const [interactionOptions, setInteractionOptions] = useState<InteractionOption[]>([]);
	const [interactionOptionActions, setInteractionOptionActions] = useState<InteractionOptionAction[]>([]);

	const fetchData = useCallback(async () => {
		const response = await interactionService.getInteractionInstances(interactionId).fetch();

		setInteractionInstance(response.interactionInstance);
		setInteractionOptions(response.interactionOptions);
		setInteractionOptionActions(response.interactionOptionActions);
	}, [interactionId]);

	const handleInteractionOptionButtonClick = async (interactionOption: InteractionOption) => {
		try {
			if (!interactionInstance) {
				throw new Error('interactionInstance is undefined.');
			}

			await interactionService
				.postInteractionOptionActions({
					interactionInstanceId: interactionInstance.interactionInstanceId,
					interactionOptionId: interactionOption.interactionOptionId,
				})
				.fetch();

			window.location.reload();
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<AsyncPage fetchData={fetchData}>
			<HeroContainer className="text-center">
				<h3 className="text-white mb-3">{interactionInstance?.caseNumber}</h3>
				<small className="text-white text-uppercase">{interactionInstance?.startDateTimeDescription}</small>
			</HeroContainer>
			<Container className="py-5">
				<Row className="pb-3">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h3 className="mb-4 text-center">Interaction Data</h3>
						<div
							dangerouslySetInnerHTML={{
								__html: interactionInstance?.metadata.endUserHtmlRepresentation || '',
							}}
						/>
					</Col>
				</Row>
				{interactionOptionActions.length > 0 && (
					<Row className="pb-3">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h3 className="mb-4 text-center">Actions Already Taken</h3>
							<ul>
								{interactionOptionActions.map((interactionOptionAction) => {
									return (
										<li key={interactionOptionAction.interactionOptionActionId}>
											<div
												dangerouslySetInnerHTML={{
													__html: interactionOptionAction.descriptionAsHtml,
												}}
											/>
										</li>
									);
								})}
							</ul>
						</Col>
					</Row>
				)}
				{interactionOptions.length > 0 && (
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h3 className="mb-4 text-center">Actions You Can Take</h3>
							{interactionOptions.map((interactionOption) => {
								return (
									<Button
										key={interactionOption.interactionOptionId}
										className="d-block w-100 mb-1"
										variant="light"
										onClick={() => {
											handleInteractionOptionButtonClick(interactionOption);
										}}
									>
										{interactionOption.optionDescription}
									</Button>
								);
							})}
						</Col>
					</Row>
				)}
			</Container>
		</AsyncPage>
	);
};

export default InteractionInstances;
