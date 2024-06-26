import React, { FC } from 'react';

import { createUseThemedStyles } from '@/jss/theme';

interface ProgressBarProps {
	current: number;
	max: number;
}

const useProgressBarStyles = createUseThemedStyles((theme) => ({
	progressBarContainer: {
		height: 6,
		position: 'relative',
		backgroundColor: theme.colors.n100,
	},
	progressBar: {
		top: 0,
		left: 0,
		bottom: 0,
		position: 'absolute',
		backgroundColor: theme.colors.s300,
		width: (props: ProgressBarProps) => `${(props.current / props.max) * 100}%`,
	},
}));

const ProgressBar: FC<ProgressBarProps> = (props) => {
	const classes = useProgressBarStyles(props);

	return (
		<div className={classes.progressBarContainer}>
			<div className={classes.progressBar} />
		</div>
	);
};

export default ProgressBar;
