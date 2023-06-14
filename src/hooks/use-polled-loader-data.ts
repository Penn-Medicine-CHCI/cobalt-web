import { useCallback, useEffect, useState } from 'react';
import useFlags from './use-flags';

interface LoaderDataWithResponseChecksum {
	getResponseChecksum: () => Promise<string | undefined>;
}

export function usePolledLoaderData<T extends LoaderDataWithResponseChecksum>({
	useLoaderHook,
	pollingFn,
	intervalSeconds = 5000,
	immediateUpdate = false,
	enabled = true,
}: {
	useLoaderHook: () => T;
	pollingFn: () => T;
	intervalSeconds?: number;
	immediateUpdate?: boolean;
	enabled?: boolean;
}) {
	const { addFlag } = useFlags();
	const loaderData = useLoaderHook();
	const [data, setData] = useState(loaderData);
	const [polledData, setPolledData] = useState(loaderData);
	const [immediateNext, setImmediateNext] = useState(false);
	const [pendingChecksum, setPendingChecksum] = useState('');
	const [[currentChecksum, polledChecksum], setChecksums] = useState(['', '']);

	const hasUpdates = !!polledChecksum && currentChecksum !== polledChecksum;

	useEffect(() => {
		loaderData.getResponseChecksum().then((checksum) => {
			setPolledData(loaderData);
			setData(loaderData);
			setChecksums([checksum ?? '', checksum ?? '']);
		});
	}, [loaderData]);

	useEffect(() => {
		if (!enabled) {
			setImmediateNext(true);
			return;
		}

		if (immediateNext) {
			setPolledData(pollingFn());
			setImmediateNext(false);
		}

		const intervalId = setInterval(() => {
			const result = pollingFn();
			setPolledData(result);
		}, intervalSeconds);

		return () => clearInterval(intervalId);
	}, [enabled, immediateNext, intervalSeconds, pollingFn]);

	useEffect(() => {
		Promise.all([data.getResponseChecksum(), polledData.getResponseChecksum()]).then(
			([dataChecksum, polledDataChecksum]) => {
				console.log({
					ui: dataChecksum,
					polled: polledDataChecksum,
				});

				setChecksums([dataChecksum ?? '', polledDataChecksum ?? '']);
			}
		);
	}, [data, polledData]);

	const updateData = useCallback(() => {
		setData(polledData);
	}, [polledData]);

	useEffect(() => {
		if (!hasUpdates) {
			return;
		} else if (immediateUpdate) {
			updateData();
		} else if (pendingChecksum !== polledChecksum) {
			setPendingChecksum(polledChecksum);
			addFlag({
				initExpanded: true,
				variant: 'bold-primary',
				title: 'New data available',
				description: 'Refresh to see the latest information',
				actions: [
					{
						title: 'Refresh screen',
						onClick: () => {
							updateData();
						},
					},
				],
			});
		}
	}, [addFlag, hasUpdates, immediateUpdate, pendingChecksum, polledChecksum, updateData]);

	return {
		data,
		hasUpdates,
		updateData,
	};
}