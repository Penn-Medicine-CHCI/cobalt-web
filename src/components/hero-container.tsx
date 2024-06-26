import React, { FC, PropsWithChildren } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const useHeroContainerStyles = createUseThemedStyles((theme) => ({
	heroContainer: {
		padding: '80px 0',
		backgroundColor: theme.colors.p50,
		[mediaQueries.lg]: {
			padding: '32px 0',
		},
	},
}));

interface HeroContainerProps extends PropsWithChildren {
	className?: string;
}

const HeroContainer: FC<HeroContainerProps> = ({ className, children }) => {
	const classes = useHeroContainerStyles();

	return (
		<Container className={classNames(classes.heroContainer, className)} fluid>
			<Container>
				<section>
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							{children}
						</Col>
					</Row>
				</section>
			</Container>
		</Container>
	);
};

export default HeroContainer;
