'use client';

import { useFormatter } from 'next-intl';
import { useRef } from 'react';

import Link from '@/components/ui/link';
import ViewCounter from '@/components/view-counter';
import useHasBeenVisible from '@/hooks/use-has-been-visible';

type PostCardProps = {
	slug: string;
	title: string;
	publishedAt: string;
	permalink: string;
};

const PostCard = ({ slug, title, publishedAt, permalink }: PostCardProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const hasBeenVisible = useHasBeenVisible(ref);
	const format = useFormatter();

	const date = format.dateTime(new Date(publishedAt), {
		month: 'long',
		day: 'numeric',
	});

	return (
		<div ref={ref}>
			<Link className='font-medium' href={permalink}>
				{title}
			</Link>
			<div className='text-sm text-foreground/60'>
				<time dateTime={publishedAt}>{date}</time>．
				{hasBeenVisible && <ViewCounter slug={slug} />}
			</div>
		</div>
	);
};

export default PostCard;
