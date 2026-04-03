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
						'group relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
						selected === option.value
							? 'border-border bg-neutral-800 text-foreground'
							: 'border-border bg-transparent text-foreground/60 hover:bg-neutral-800/50 hover:text-foreground',
					)}
				>
					<span
						className={cn(
							'absolute -bottom-px left-1/2 h-px w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent transition-opacity',
							selected === option.value
								? 'opacity-100'
								: 'opacity-0 group-hover:opacity-40',
						)}
					/>
					{option.label}
					<span className='ml-1.5 opacity-50'>{option.count}</span>
				</button>
			))}
		</div>
	);
}
