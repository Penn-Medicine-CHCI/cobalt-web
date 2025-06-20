import React, { useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import {
	ScreeningAnswerContentHintId,
	screeningAnswerContentHintIdToInputType,
	ScreeningAnswerOption,
	ScreeningAnswerSelection,
	ScreeningAnswersQuestionResult,
} from '@/lib/models';
import InputHelper from '@/components/input-helper';

interface ScreeningAnswerFreeformTextProps {
	options: ScreeningAnswerOption[];
	value: ScreeningAnswerSelection[];
	onChange(value: ScreeningAnswerSelection[]): void;
	questionResultsByScreeningAnswerOptionId?: Record<string, ScreeningAnswersQuestionResult>;
	screeningAnswerContentHintId?: ScreeningAnswerContentHintId;
}

export const ScreeningAnswerFreeformText = ({
	options,
	value,
	onChange,
	screeningAnswerContentHintId,
}: ScreeningAnswerFreeformTextProps) => {
	const firstOptionRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		firstOptionRef.current?.focus();
	}, []);

	return (
		<Form.Group>
			{options.map((option, optionIndex) => {
				const currentValue =
					value.find((v) => v.screeningAnswerOptionId === option.screeningAnswerOptionId)?.text ?? '';
				const type = screeningAnswerContentHintId
					? screeningAnswerContentHintIdToInputType[screeningAnswerContentHintId]
					: 'text';

				return (
					<InputHelper
						ref={optionIndex === 0 ? firstOptionRef : undefined}
						key={option.screeningAnswerOptionId}
						type={type}
						value={currentValue}
						onChange={({ currentTarget }) => {
							if (currentTarget.value.trim().length < 1) {
								onChange([]);
								return;
							}

							onChange([
								{
									screeningAnswerOptionId: option.screeningAnswerOptionId,
									text: currentTarget.value,
								},
							]);
						}}
						label={option.answerOptionText ?? ''}
					/>
				);
			})}
		</Form.Group>
	);
};
