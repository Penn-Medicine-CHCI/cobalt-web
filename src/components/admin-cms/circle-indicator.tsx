import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';

import fonts from '@/jss/fonts';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	circleIndicator: ({ size }: { size?: number }) => ({
		flexShrink: 0,
		borderRadius: 100,
		width: size ? size : 35,
		height: size ? size : 35,
		lineHeight: size ? `${size}px` : '35px',
		textAlign: 'center',
		color: theme.colors.white,
		display: 'inline-block',
		...fonts.nunitoSansBold,
		backgroundColor: theme.colors.secondary,
	}),
}));

interface CircleIndicatorProps extends PropsWithChildren {
	size?: number;
	className?: string;
}

const CircleIndicator: FC<CircleIndicatorProps> = ({ size, className, children }) => {
	const classes = useStyles({
		size,
	});

	return <span className={classNames([classes.circleIndicator, className])}>{children}</span>;
};

export default CircleIndicator;
