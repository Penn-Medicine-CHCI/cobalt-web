import colors from '@/jss/colors';
import React, { FC } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	thankYouCard: {
		border: 0,
		borderRadius: 0,
		textAlign: 'center',
		padding: '40px 40px 70px',
		borderTop: `20px solid ${colors.success}`,
	},
});

const OnYourTimeThanks: FC = () => {
	const classes = useStyles();

	return (
		<Container className="py-20">
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<Card className={classes.thankYouCard}>
						<h2 className="mb-5">thank you</h2>
						<p>
							<small>
								Your content has been submitted and will become available after an admin has approved
								it.
							</small>
						</p>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default OnYourTimeThanks;
