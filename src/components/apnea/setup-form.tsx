'use client';

import { useState } from 'react';

import { cn } from '@/utils/cn';

type TableType = 'co2' | 'o2';

type SetupFormProps = {
	currentPB: number;
	onSubmit: (pbSeconds: number, tableType: TableType) => void;
};

export default function SetupForm({ currentPB, onSubmit }: SetupFormProps) {
	const [minutes, setMinutes] = useState(
		String(Math.floor(currentPB / 60)).padStart(2, '0'),
	);
	const [seconds, setSeconds] = useState(
		String(currentPB % 60).padStart(2, '0'),
	);
	const [tableType, setTableType] = useState<TableType>('co2');

	const totalSeconds = parseInt(minutes || '0') * 60 + parseInt(seconds || '0');

	const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value.replace(/\D/g, '').slice(0, 2);
		setMinutes(val);
		if (val.length === 2) {
			document.getElementById('apnea-pb-seconds')?.focus();
		}
	};

	const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value.replace(/\D/g, '').slice(0, 2);
		if (parseInt(val) <= 59 || val === '') setSeconds(val);
	};

	const handleBlur = (
		setter: (v: string) => void,
		val: string,
		max: number,
	) => {
		const num = Math.min(parseInt(val || '0'), max);
		setter(String(num).padStart(2, '0'));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (totalSeconds > 0) onSubmit(totalSeconds, tableType);
	};

	return (
		<div className='animate-fade-in'>
			<form
				onSubmit={handleSubmit}
				className='max-w-sm mx-auto px-4'
			>
				{/* Time input */}
				<div className='flex items-center justify-center gap-4 mb-10'>
					<div className='flex flex-col items-center gap-2'>
						<label className='text-xs text-foreground/40 uppercase tracking-wider'>
							Min
						</label>
						<input
							type='text'
							inputMode='numeric'
							value={minutes}
							onChange={handleMinutesChange}
							onFocus={(e) => e.target.select()}
							onBlur={(e) => handleBlur(setMinutes, e.target.value, 15)}
							placeholder='00'
							className='w-20 h-16 text-center text-3xl font-bold bg-neutral-800/80 border border-border rounded-xl text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors'
						/>
					</div>
					<span className='text-3xl font-bold text-foreground/30 mt-6'>:</span>
					<div className='flex flex-col items-center gap-2'>
						<label className='text-xs text-foreground/40 uppercase tracking-wider'>
							Sec
						</label>
						<input
							type='text'
							inputMode='numeric'
							id='apnea-pb-seconds'
							value={seconds}
							onChange={handleSecondsChange}
							onFocus={(e) => e.target.select()}
							onBlur={(e) => handleBlur(setSeconds, e.target.value, 59)}
							placeholder='00'
							className='w-20 h-16 text-center text-3xl font-bold bg-neutral-800/80 border border-border rounded-xl text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors'
						/>
					</div>
				</div>

				{/* Table type toggle */}
				<div className='flex rounded-full border border-border bg-neutral-800/50 p-1 mb-4'>
					{(['co2', 'o2'] as TableType[]).map((type) => (
						<button
							key={type}
							type='button'
							onClick={() => setTableType(type)}
							className={cn(
								'flex-1 h-9 rounded-full text-sm font-medium transition-all duration-200',
								tableType === type
									? 'bg-neutral-700 text-foreground shadow-sm'
									: 'text-foreground/40 hover:text-foreground/60',
							)}
						>
							{type === 'co2' ? 'CO₂ Table' : 'O₂ Table'}
						</button>
					))}
				</div>

				<button
					type='submit'
					disabled={totalSeconds === 0}
					className='group relative w-full h-12 rounded-full border border-border bg-neutral-800 font-medium text-sm text-foreground hover:bg-neutral-800/0 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200'
					id='apnea-generate-tables'
				>
					<div className='absolute -bottom-px left-1/2 h-px w-14 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
					Start Training
				</button>
			</form>
		</div>
	);
}
