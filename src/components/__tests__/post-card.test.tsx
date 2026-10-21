import { render, screen } from '@testing-library/react';

import PostCard from '@/components/post-card';
import useHasBeenVisible from '@/hooks/use-has-been-visible';

jest.mock('@/hooks/use-has-been-visible', () => jest.fn());
jest.mock('@/components/view-counter', () => {
	const ViewCounter = () => <div data-testid='view-counter' />;

	return ViewCounter;
});

describe('PostCard', () => {
	const post = {
		title: '測試文章',
		slug: 'test-post',
		publishedAt: '2024-06-12',
		permalink: '/blog/test-post',
	};

	beforeEach(() => {
		(useHasBeenVisible as jest.Mock).mockReturnValue(false);
	});

	it('should render the post title and link ', () => {
		render(<PostCard {...post} />);

		const link = screen.getByRole('link', { name: /測試文章/i });

		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/blog/test-post');
	});

	it('should render formatted date', () => {
		render(<PostCard {...post} />);

		const date = screen.getByText('12. juni');

		expect(date).toBeInTheDocument();
		expect(date).toHaveAttribute('dateTime', '2024-06-12');
	});

	it('should not render ViewCounter when enabled is false', () => {
		render(<PostCard {...post} />);

		const viewCounter = screen.queryByTestId('view-counter');

		expect(viewCounter).not.toBeInTheDocument();
	});

	it('should render ViewCounter when enabled is true', () => {
		(useHasBeenVisible as jest.Mock).mockReturnValue(true);
		render(<PostCard {...post} />);

		const viewCounter = screen.getByTestId('view-counter');

		expect(viewCounter).toBeInTheDocument();
	});
});
