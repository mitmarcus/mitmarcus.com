'use client';

import type { InstaCategory } from '@/types/insta';
import { cn } from '@/utils/cn';

type FilterOption = {
	label: string;
	value: InstaCategory | 'all';
	count: number;
};

type CategoryFilterProps = {
	options: FilterOption[];
	selected: InstaCategory | 'all';
	onChange: (value: InstaCategory | 'all') => void;
};

export default function CategoryFilter({
	options,
	selected,
	onChange,
}: CategoryFilterProps) {
	return (
		<div className='flex flex-wrap gap-2'>
			{options.map((option) => (
				<button
					key={option.value}
					onClick={() => onChange(option.value)}
					className={cn(
						'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
						selected === option.value
							? 'bg-primary text-primary-foreground'
							: 'bg-card text-muted-foreground hover:text-foreground border border-border',
					)}
				>
					{option.label}
					<span className='ml-1.5 opacity-60'>{option.count}</span>
				</button>
			))}
		</div>
	);
}
