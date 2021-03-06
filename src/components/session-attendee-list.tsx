import React, { FC } from 'react';
import { Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import colors from '@/jss/colors';
import { GroupSessionReservationModel } from '@/lib/models';

const useStyles = createUseStyles({
	sessionAttendeeList: {
		backgroundColor: colors.white,
	},
	listHeader: {
		display: 'flex',
		alignItems: 'bottom',
		padding: '26px 30px 15px',
		justifyContent: 'space-between',
	},
	list: {
		margin: 0,
		padding: 0,
		listStyle: 'none',
		borderTop: `1px solid ${colors.border}`,
		'& li': {
			padding: '15px 30px',
			borderBottom: `1px solid ${colors.border}`,
		},
	},
});

interface SessionAttendeeList {
	attendees: GroupSessionReservationModel[];
	capacity: number;
}

const SessionAttendeeList: FC<SessionAttendeeList> = ({ attendees, capacity }) => {
	const classes = useStyles();

	function handleEmailAllButtonClick() {
		const recipients = attendees.map((attendee) => {
			return encodeURIComponent(attendee.emailAddress);
		});
		const subject = 'Cobalt - Regarding your studio session';

		window.open(`mailto:?bcc=${recipients}&subject=${subject}`);
	}

	return (
		<aside className={classes.sessionAttendeeList}>
			<div className={classes.listHeader}>
				<h5 className="mb-0">Attendees</h5>
				<p className="mb-0">
					{attendees.length}/{capacity}
				</p>
			</div>
			<ul className={classes.list}>
				<>
					{attendees.map((attendee) => {
						return (
							<li key={attendee.groupSessionReservationId} className="pt-3 pb-3">
								<p className="mb-0 font-weight-bold">{attendee.name ?? 'anonymous user'}</p>
								<p className="mb-0 font-weight-bold">
									<a href="mailto:">{attendee.emailAddress}</a>
								</p>
							</li>
						);
					})}
				</>
			</ul>
			<div className="pt-5 pb-5 d-flex justify-content-center">
				<Button size="sm" onClick={handleEmailAllButtonClick}>
					email all attendees
				</Button>
			</div>
		</aside>
	);
};

export default SessionAttendeeList;
