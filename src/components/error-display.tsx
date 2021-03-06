import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';

import HeroContainer from '@/components/hero-container';
import RenderJson from '@/components/render-json';

interface ErrorDisplayProps {
	error: any;
	showBackButton?: boolean;
	showRetryButton?: boolean;
	onRetryButtonClick?(): void;
}

const ErrorDisplay: FC<ErrorDisplayProps> = ({ error, showBackButton, showRetryButton, onRetryButtonClick }) => {
	const history = useHistory();

	function handleGoBackButtonClick() {
		history.goBack();
	}

	function handleRetryClick() {
		if (onRetryButtonClick) onRetryButtonClick();
	}

	return (
		<>
			<HeroContainer>
				<h6 className="mb-0 text-white text-center">We're sorry, an error occurred.</h6>
				<p className="mb-0 text-white text-center">{error.message}</p>
			</HeroContainer>
			<Container className="pt-4 pb-5">
				<Row className="text-center">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{showBackButton && (
							<Button onClick={handleGoBackButtonClick} className="mr-2">
								Go Back
							</Button>
						)}
						{showRetryButton && <Button onClick={handleRetryClick}>Retry</Button>}
					</Col>
				</Row>
				<Row>
					<Col>
						<RenderJson json={error} />
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default ErrorDisplay;
