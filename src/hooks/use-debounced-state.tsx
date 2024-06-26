import { useEffect, useState } from 'react';

export function useDebouncedState<T>(value: T, delay: number = 300): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return [debouncedValue, setDebouncedValue];
}

export default useDebouncedState;
