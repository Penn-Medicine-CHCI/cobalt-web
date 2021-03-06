import { cloneDeep } from 'lodash';
import React, { FC, useEffect, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { ContentListFormat } from '@/lib/services';

const useStyles = createUseStyles({
	modal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterFormatProps extends ModalProps {
	formats: ContentListFormat[];
	selectedFormatIds: string[];
	onSave(selectedFormatIds: string[]): void;
}

const FilterFormat: FC<FilterFormatProps> = ({ formats, selectedFormatIds, onSave, ...props }) => {
	const classes = useStyles();
	const [internalSelectedFormatIds, setInternalSelectedFormatIds] = useState<string[]>([]);

	useEffect(() => {
		if (props.show) {
			setInternalSelectedFormatIds(selectedFormatIds);
		}
	}, [props.show, selectedFormatIds]);

	function handleSelectAllButtonClick() {
		const allOptionValues = formats.map((format) => format.contentTypeLabelId);
		setInternalSelectedFormatIds(allOptionValues);
	}

	function handleDeselectAllButtonClick() {
		setInternalSelectedFormatIds([]);
	}

	function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { checked, value } = event.currentTarget;
		const internalSelectedFormatIdsClone = cloneDeep(internalSelectedFormatIds);

		if (checked) {
			internalSelectedFormatIdsClone.push(value);
		} else {
			const targetIndex = internalSelectedFormatIdsClone.findIndex((sf) => sf === value);
			internalSelectedFormatIdsClone.splice(targetIndex, 1);
		}

		setInternalSelectedFormatIds(internalSelectedFormatIdsClone);
	}

	function handleSaveButtonClick() {
		onSave(internalSelectedFormatIds);
	}

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Header>
				<h3 className="mb-0">format</h3>
			</Modal.Header>
			<Modal.Body>
				<div className="d-flex mb-3">
					<Button variant="link" className="p-0" onClick={handleSelectAllButtonClick}>
						select all
					</Button>
					<Button variant="link" className="ml-3 p-0" onClick={handleDeselectAllButtonClick}>
						deselect all
					</Button>
				</div>
				<Form>
					{formats.map((format, index) => {
						return (
							<Form.Check
								key={`${format.contentTypeLabelId}-${index}`}
								type="checkbox"
								bsPrefix="cobalt-modal-form__check"
								name="on-your-time__filter-format"
								id={`on-your-time__filter-format--${format.contentTypeLabelId}`}
								label={format.description}
								value={format.contentTypeLabelId}
								checked={internalSelectedFormatIds.includes(format.contentTypeLabelId)}
								onChange={handleCheckboxChange}
							/>
						);
					})}
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>
				<Button variant="primary" size="sm" onClick={handleSaveButtonClick}>
					save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterFormat;
