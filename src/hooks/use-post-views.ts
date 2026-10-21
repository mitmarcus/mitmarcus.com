import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

const API_URL = '/api/views';

type ViewsKey = [typeof API_URL, string];

const getPostViews = async ([url, slug]: ViewsKey): Promise<number> => {
	const res = await fetch(`${url}?slug=${encodeURIComponent(slug)}`);

	if (!res.ok) {
		throw new Error('An error occurred while fetching the data.');
	}

	return res.json();
};

const updatePostViews = async ([url, slug]: ViewsKey): Promise<number> => {
	const res = await fetch(`${url}?slug=${encodeURIComponent(slug)}`, {
		method: 'POST',
	});

	if (!res.ok) {
		throw new Error('An error occurred while posting the data.');
	}

	return res.json();
};

const usePostViews = (slug: string) => {
	const key: ViewsKey = [API_URL, slug];

	const {
		data: views,
		error,
		isLoading,
	} = useSWR(key, getPostViews, { dedupingInterval: 60000 });

	const { trigger: increment } = useSWRMutation(key, updatePostViews, {
		populateCache: true,
		revalidate: false,
		throwOnError: false,
	});

	return {
		views,
		isLoading,
		isError: !!error,
		increment,
	};
};

export default usePostViews;
