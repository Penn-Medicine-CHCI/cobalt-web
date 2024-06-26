import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import MultiCarousel, { CarouselProps as MultiCarouselProps, ButtonGroupProps } from 'react-multi-carousel';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import mediaQueries from '@/jss/media-queries';

import { ReactComponent as LeftChevron } from '@/assets/icons/icon-chevron-left.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';

const gutterWidth = 30;

export const responsiveDefaults = {
	externalMonitor: {
		breakpoint: { max: 3000, min: 1201 },
		items: 3,
		partialVisibilityGutter: 0,
	},
	desktopExtraLarge: {
		breakpoint: { max: 1200, min: 993 },
		items: 3,
		partialVisibilityGutter: 0,
	},
	desktop: {
		breakpoint: { max: 992, min: 769 },
		items: 2,
		partialVisibilityGutter: 0,
	},
	tablet: {
		breakpoint: { max: 768, min: 575 },
		items: 1,
		partialVisibilityGutter: 0,
	},
	mobile: {
		breakpoint: { max: 575, min: 0 },
		items: 1,
		partialVisibilityGutter: 72,
	},
};

/* -------------------------------------------------------------------- */
/* Button Group */
/* -------------------------------------------------------------------- */
interface UseCustomButtonGroupStylesProps {
	floatingButtonGroup?: boolean;
}

const useCustomButtonGroupStyles = createUseStyles({
	customButtonGroupOuter: {
		top: 0,
		left: 0,
		right: 0,
		position: 'absolute',
		paddingLeft: gutterWidth / 2,
		paddingRight: gutterWidth / 2,
		transform: ({ floatingButtonGroup }: UseCustomButtonGroupStylesProps) =>
			floatingButtonGroup ? 'translateY(calc(-50% + 16px))' : undefined,
	},
	customButtonGroup: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		[mediaQueries.lg]: {
			display: ({ floatingButtonGroup }: UseCustomButtonGroupStylesProps) =>
				floatingButtonGroup ? 'flex' : 'block',
		},
	},
	descriptionText: {
		marginBottom: 0,
		[mediaQueries.lg]: {
			marginBottom: 16,
		},
	},
	carouselButtons: {
		padding: 0,
		width: ({ floatingButtonGroup }: UseCustomButtonGroupStylesProps) => (floatingButtonGroup ? 48 : 32),
		height: ({ floatingButtonGroup }: UseCustomButtonGroupStylesProps) => (floatingButtonGroup ? 48 : 32),
		boxShadow: ({ floatingButtonGroup }: UseCustomButtonGroupStylesProps) =>
			floatingButtonGroup ? '0px 3px 5px rgba(41, 40, 39, 0.2), 0px 0px 1px rgba(41, 40, 39, 0.31)' : undefined,
	},
});

interface CustomButtonGroupProps extends ButtonGroupProps {
	description?: string;
	calloutTitle?: string;
	calloutOnClick?(): void;
	onElementHeightChange(height: number): void;
	floatingButtonGroup?: boolean;
}

const CustomButtonGroup = ({
	next,
	previous,
	carouselState,
	description,
	calloutTitle,
	calloutOnClick,
	onElementHeightChange,
	floatingButtonGroup,
}: CustomButtonGroupProps) => {
	const classes = useCustomButtonGroupStyles({
		floatingButtonGroup,
	});
	const customButtonGroupRef = useRef<HTMLDivElement>(null);

	const getElementHeight = useCallback(() => {
		if (!customButtonGroupRef.current) {
			onElementHeightChange(0);
			return;
		}

		onElementHeightChange(customButtonGroupRef.current.clientHeight);
	}, [onElementHeightChange]);

	const handleWindowResize = useCallback(() => {
		getElementHeight();
	}, [getElementHeight]);

	useEffect(() => {
		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [handleWindowResize]);

	useEffect(() => {
		getElementHeight();
	}, [getElementHeight]);

	let noMorePreviousSlides = true;
	let noMoreNextSlides = true;

	if (carouselState) {
		noMorePreviousSlides = carouselState.currentSlide === 0;

		if (carouselState.totalItems - carouselState.slidesToShow < 0) {
			noMoreNextSlides = true;
		} else {
			noMoreNextSlides = carouselState.currentSlide === carouselState.totalItems - carouselState.slidesToShow;
		}
	}

	return (
		<div ref={customButtonGroupRef} className={classes.customButtonGroupOuter}>
			<div className={classes.customButtonGroup}>
				<div>{description && <h3 className={classes.descriptionText}>{description}</h3>}</div>
				<div className="d-flex align-items-center justify-content-between">
					<div className="d-flex align-items-center">
						<Button
							className={classNames(classes.carouselButtons, 'me-4')}
							variant="light"
							size="sm"
							disabled={noMorePreviousSlides}
							onClick={previous}
						>
							<LeftChevron />
						</Button>
						<Button
							className={classes.carouselButtons}
							variant="light"
							size="sm"
							disabled={noMoreNextSlides}
							onClick={next}
						>
							<RightChevron />
						</Button>
					</div>
					{calloutTitle && (
						<Button
							className="ms-6 d-flex align-items-center"
							variant="light"
							size="sm"
							onClick={calloutOnClick}
						>
							{calloutTitle} <RightChevron />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

/* -------------------------------------------------------------------- */
/* Carousel */
/* -------------------------------------------------------------------- */
interface UseCarouselStylesProps {
	customButtonGroupHeight: number;
	trackStyles?: React.CSSProperties;
	floatingButtonGroup?: boolean;
}

const useCarouselStyles = createUseStyles({
	carouselOuter: ({ customButtonGroupHeight, floatingButtonGroup, trackStyles }: UseCarouselStylesProps) => ({
		paddingTop: floatingButtonGroup ? 0 : customButtonGroupHeight,
		position: 'relative',
		marginLeft: -gutterWidth / 2,
		marginRight: -gutterWidth / 2,
		'& .react-multi-carousel-track': {
			paddingTop: 16,
			paddingBottom: 24,
		},
		...(trackStyles
			? {
					'& .react-multi-carousel-track': {
						...trackStyles,
					},
			  }
			: {}),
	}),
	carouselItem: {
		maxWidth: 430,
		paddingLeft: gutterWidth / 2,
		paddingRight: gutterWidth / 2,
		[mediaQueries.xxl]: {
			maxWidth: 364,
		},
		[mediaQueries.xl]: {
			maxWidth: 316,
		},
		[mediaQueries.lg]: {
			maxWidth: 355,
		},
		[mediaQueries.md]: {
			maxWidth: 265,
		},
	},
});

interface CarouselProps extends MultiCarouselProps {
	description?: string;
	calloutTitle?: string;
	calloutOnClick?(): void;
	trackStyles?: React.CSSProperties;
	floatingButtonGroup?: boolean;
}

const Carousel = ({
	description,
	children,
	calloutTitle,
	calloutOnClick,
	trackStyles,
	floatingButtonGroup,
	...rest
}: PropsWithChildren<CarouselProps>) => {
	const { hasTouchScreen } = useTouchScreenCheck();
	const [customButtonGroupHeight, setCustomButtonGroupHeight] = useState(0);
	const classes = useCarouselStyles({
		customButtonGroupHeight,
		trackStyles,
		floatingButtonGroup,
	});

	return (
		<div className={classes.carouselOuter}>
			<MultiCarousel
				partialVisible={true}
				// disable swipe/touch until fix with page overscrolling
				swipeable={!hasTouchScreen}
				draggable={false}
				arrows={false}
				customButtonGroup={
					<CustomButtonGroup
						description={description}
						calloutTitle={calloutTitle}
						calloutOnClick={calloutOnClick}
						onElementHeightChange={setCustomButtonGroupHeight}
						floatingButtonGroup={floatingButtonGroup}
					/>
				}
				renderButtonGroupOutside={true}
				itemClass={classes.carouselItem}
				{...rest}
			>
				{children}
			</MultiCarousel>
		</div>
	);
};

export default Carousel;
