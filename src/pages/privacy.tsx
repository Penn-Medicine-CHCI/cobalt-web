import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import useHeaderTitle from '@/hooks/use-header-title';
import useAccount from '@/hooks/use-account';

const Privacy: FC = () => {
	useHeaderTitle('Privacy');
	const { institution } = useAccount();

	return (
		<Container className="pt-5 pb-5">
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<div dangerouslySetInnerHTML={{ __html: institution?.privacyContent ?? '' }} />
				</Col>
			</Row>
		</Container>
	);
};

export default Privacy;
