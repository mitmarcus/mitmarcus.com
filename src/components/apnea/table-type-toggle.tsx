'use client';

import { cn } from '@/utils/cn';

export type TableType = 'co2' | 'o2';

const TABLE_OPTIONS: { value: TableType; label: string }[] = [
	{ value: 'co2', label: 'CO₂ Table' },
	{ value: 'o2', label: 'O₂ Table' },
];

type TableTypeToggleProps = {
	value: TableType;
	onChange: (value: TableType) => void;
};

export default function TableTypeToggle({
	value,
	onChange,
}: TableTypeToggleProps) {
	return (
		<div className='flex rounded-full border border-border bg-neutral-800/50 p-1 mb-4'>
			{TABLE_OPTIONS.map((option) => (
				<button
					key={option.value}
					type='button'
					aria-pressed={value === option.value}
					onClick={() => onChange(option.value)}
					className={cn(
						'flex-1 h-9 rounded-full text-sm font-medium transition-all duration-200',
						value === option.value
							? 'bg-neutral-700 text-foreground shadow-xs'
							: 'text-foreground/40 hover:text-foreground/60',
					)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}
