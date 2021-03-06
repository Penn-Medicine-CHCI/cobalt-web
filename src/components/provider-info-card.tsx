import React, { FC, useMemo } from 'react';
import BackgroundImageContainer from '@/components/background-image-container';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import { createUseStyles } from 'react-jss';
import fonts from '@/jss/fonts';
import colors from '@/jss/colors';
import { Provider } from '@/lib/models';
import { Link } from 'react-router-dom';

const useProviderInfoStyles = createUseStyles({
	paymentPill: {
		...fonts.xxs,
		color: colors.dark,
		display: 'inline-block',
		border: `2px solid ${colors.border}`,
		borderRadius: 20,
		marginTop: 4,
		padding: '2px 6px',
	},
	childrenOuter: {
		display: 'inline-block',
		transform: 'translateY(4px)',
	},
});

export const ProviderInfoCard: FC<{
	provider: Provider;
	linkToExternalBio?: boolean;
	hideSpecifics?: boolean;
}> = ({ provider, linkToExternalBio = false, hideSpecifics = false, children }) => {
	const classes = useProviderInfoStyles();
	const placeholderImage = useRandomPlaceholderImage();
	const finalTitle = provider.title ? provider.title : provider.supportRolesDescription;

	let entityName = provider.entity || provider.clinic ? joinComma(provider.entity, provider.clinic) : null;

	// It's possible this is the same as the title.  If so, null it out
	// so we don't show the same text twice
	if (entityName && entityName === finalTitle) {
		entityName = null;
	}

	const renderedLink = useMemo(() => {
		const linkText = joinComma(provider.name, provider.license);

		// Temporary hack
		if (provider.providerId === 'xxxx-xxxx-xxxx-xxxx') {
			return linkText;
		}

		if (!linkToExternalBio) {
			return <Link to={`/providers/${provider.providerId}`}>{linkText}</Link>;
		}

		if (provider.bioUrl) {
			return (
				<a href={provider.bioUrl} target="_blank" rel="noreferrer">
					{linkText}
				</a>
			);
		}

		return linkText;
	}, [linkToExternalBio, provider.bioUrl, provider.license, provider.name, provider.providerId]);

	return (
		<div className="d-flex align-items-center">
			<BackgroundImageContainer size={116} imageUrl={provider.imageUrl || placeholderImage} />
			<div className="pl-3">
				<h5 className="mb-0">{renderedLink}</h5>

				{/* {provider.schedulingSystemId !== 'EPIC' && (
				<p className={classNames('d-inline-block text-white px-2', classes.acceptsAnons)}>
					<small>Accepts Anonymous Patients</small>
				</p>
				)} */}

				{finalTitle && (
					<p className="mb-0">
						<i>{finalTitle}</i>
					</p>
				)}

				{provider.treatmentDescription ? (
					<p className="mb-0">
						<strong>{provider.treatmentDescription}</strong>
					</p>
				) : (
					provider.specialty && <p className="mb-0">{provider.specialty}</p>
				)}

				{entityName && <p className="mb-0">{entityName}</p>}

				<div>
					{!hideSpecifics &&
						provider.paymentFundingDescriptions &&
						provider.paymentFundingDescriptions.map((paymentOption, index) => {
							return (
								<div className={classes.paymentPill} key={index}>
									{paymentOption}
								</div>
							);
						})}
				</div>

				<div className={classes.childrenOuter}>{children}</div>
			</div>
		</div>
	);
};

function joinComma(valueOne: string, valueTwo: string) {
	if (valueOne && valueTwo) {
		return `${valueOne}, ${valueTwo}`;
	} else if (valueOne) {
		return valueOne;
	} else if (valueTwo) {
		return valueTwo;
	}

	return '';
}
