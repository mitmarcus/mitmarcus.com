import { render, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { SWRConfig } from 'swr';

import ViewCounter from '@/components/view-counter';

const renderCounter = (slug: string) =>
	render(
		<StrictMode>
			<SWRConfig value={{ provider: () => new Map() }}>
				<ViewCounter slug={slug} shouldIncrement />
			</SWRConfig>
		</StrictMode>,
	);

const postCalls = (fetchMock: jest.Mock) =>
	fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');

describe('ViewCounter', () => {
	let fetchMock: jest.Mock;

	beforeEach(() => {
		fetchMock = jest.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(1),
		});
		global.fetch = fetchMock;
	});

	it('should count a view once under StrictMode', async () => {
		renderCounter('strict-post');

		await waitFor(() => expect(fetchMock).toHaveBeenCalled());

		expect(postCalls(fetchMock)).toHaveLength(1);
	});

	it('should not count the same post again on remount', async () => {
		renderCounter('remount-post').unmount();
		renderCounter('remount-post');

		await waitFor(() => expect(fetchMock).toHaveBeenCalled());

		expect(postCalls(fetchMock)).toHaveLength(1);
	});

	it('should count different posts separately', async () => {
		renderCounter('first-post');
		renderCounter('second-post');

		await waitFor(() => expect(postCalls(fetchMock)).toHaveLength(2));
	});

	it('should not touch browser storage', async () => {
		renderCounter('storage-post');

		await waitFor(() => expect(fetchMock).toHaveBeenCalled());

		expect(sessionStorage).toHaveLength(0);
		expect(localStorage).toHaveLength(0);
		expect(document.cookie).toBe('');
	});
});
