import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { PatientOrderModel, PatientOrderNoteModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';
import { MhicComment, MhicEditCommentModal } from '@/components/integrated-care/mhic';
import { createUseThemedStyles } from '@/jss/theme';
import useFlags from '@/hooks/use-flags';

const useStyles = createUseThemedStyles((theme) => ({
	comments: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	commentList: {
		flex: 1,
		padding: 32,
		overflowY: 'auto',
	},
	inputOuter: {
		padding: 32,
		backgroundColor: theme.colors.n0,
		boxShadow: '0px -4px 8px rgba(41, 40, 39, 0.15), 0px 0px 1px rgba(41, 40, 39, 0.31)',
	},
}));

interface Props {
	patientOrder: PatientOrderModel;
	onPatientOrderChange(patientOrder: PatientOrderModel): void;
}

export const MhicComments = ({ patientOrder, onPatientOrderChange }: Props) => {
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const classes = useStyles();
	const [commentInputValue, setCommentInputValue] = useState('');
	const [commentToEdit, setCommentToEdit] = useState<PatientOrderNoteModel>();

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				if (!patientOrder.patientMrn) {
					throw new Error('patientOrder.patientMrn is undefined.');
				}

				await integratedCareService
					.postNote({
						patientOrderId: patientOrder.patientOrderId,
						note: commentInputValue,
					})
					.fetch();
				const patientOverviewResponse = await integratedCareService
					.getPatientOverview(patientOrder.patientMrn)
					.fetch();

				onPatientOrderChange(patientOverviewResponse.currentPatientOrder);
				setCommentInputValue('');
				addFlag({
					variant: 'success',
					title: 'Comment added',
					description: '{Message}',
					actions: [],
				});
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, commentInputValue, handleError, onPatientOrderChange, patientOrder]
	);

	const handleEditCommentSave = useCallback(async () => {
		try {
			if (!patientOrder.patientMrn) {
				throw new Error('patientOrder.patientMrn is undefined.');
			}

			const patientOverviewResponse = await integratedCareService
				.getPatientOverview(patientOrder.patientMrn)
				.fetch();

			setCommentToEdit(undefined);
			onPatientOrderChange(patientOverviewResponse.currentPatientOrder);
			addFlag({
				variant: 'success',
				title: 'Comment updated',
				description: '{Message}',
				actions: [],
			});
		} catch (error) {
			handleError(error);
		}
	}, [addFlag, handleError, onPatientOrderChange, patientOrder.patientMrn]);

	const handleDeleteComment = useCallback(
		async (patientOrderNoteId: string) => {
			if (!window.confirm('Are you sure?')) {
				return;
			}

			try {
				if (!patientOrder.patientMrn) {
					throw new Error('patientOrder.patientMrn is undefined.');
				}

				await integratedCareService.deleteNote(patientOrderNoteId).fetch();
				const patientOverviewResponse = await integratedCareService
					.getPatientOverview(patientOrder.patientMrn)
					.fetch();

				onPatientOrderChange(patientOverviewResponse.currentPatientOrder);
				addFlag({
					variant: 'success',
					title: 'Comment deleted',
					description: '{Message}',
					actions: [],
				});
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, onPatientOrderChange, patientOrder.patientMrn]
	);

	return (
		<>
			<MhicEditCommentModal
				patientOrderNote={commentToEdit}
				show={!!commentToEdit}
				onHide={() => {
					setCommentToEdit(undefined);
				}}
				onSave={handleEditCommentSave}
			/>

			<div className={classes.comments}>
				<div className={classes.commentList}>
					<Container fluid className="overflow-visible">
						<Row>
							<Col>
								{(patientOrder.patientOrderNotes ?? []).map((note, noteIndex) => {
									const isLast = noteIndex === (patientOrder.patientOrderNotes ?? []).length - 1;
									return (
										<MhicComment
											key={note.patientOrderNoteId}
											className={classNames({ 'mb-4': !isLast })}
											name={note.account.displayName ?? ''}
											date={note.createdDescription}
											message={note.note}
											onEdit={() => {
												setCommentToEdit(note);
											}}
											onDelete={() => {
												handleDeleteComment(note.patientOrderNoteId);
											}}
										/>
									);
								})}
							</Col>
						</Row>
					</Container>
				</div>
				<div className={classes.inputOuter}>
					<Form onSubmit={handleFormSubmit}>
						<InputHelper
							className="mb-4"
							as="textarea"
							label="Comment"
							value={commentInputValue}
							onChange={({ currentTarget }) => {
								setCommentInputValue(currentTarget.value);
							}}
						/>
						<div className="text-right">
							<Button type="submit" disabled={!commentInputValue}>
								Add Comment
							</Button>
						</div>
					</Form>
				</div>
			</div>
		</>
	);
};
