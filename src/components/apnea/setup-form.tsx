'use client';

import { useMemo, useRef, useState } from 'react';
import { RiRepeatLine, RiTimeLine } from 'react-icons/ri';

import TableTypeToggle, {
	type TableType,
} from '@/components/apnea/table-type-toggle';
import TimeDigitInput from '@/components/apnea/time-digit-input';
import {
	formatTime,
	generateCO2Table,
	generateO2Table,
	totalTableTime,
} from '@/utils/apnea/apnea-tables';

type SetupFormProps = {
	currentPB: number;
	onSubmit: (pbSeconds: number, tableType: TableType) => void;
};

const MAX_MINUTES = 15;
const MAX_SECONDS = 59;
const DIGITS = 2;

const pad = (n: number) => String(n).padStart(DIGITS, '0');

export default function SetupForm({ currentPB, onSubmit }: SetupFormProps) {
	const [minutes, setMinutes] = useState(pad(Math.floor(currentPB / 60)));
	const [seconds, setSeconds] = useState(pad(currentPB % 60));
	const [tableType, setTableType] = useState<TableType>('co2');
	const secondsRef = useRef<HTMLInputElement>(null);

	const totalSeconds =
		parseInt(minutes || '0', 10) * 60 + parseInt(seconds || '0', 10);

	const preview = useMemo(() => {
		if (totalSeconds <= 0) return null;
		const table =
			tableType === 'co2'
				? generateCO2Table(totalSeconds)
				: generateO2Table(totalSeconds);
		return {
			rounds: table.rounds.length,
			duration: totalTableTime(table),
		};
	}, [totalSeconds, tableType]);

	const handleMinutesChange = (val: string) => {
		setMinutes(val);
		if (val.length === DIGITS) secondsRef.current?.focus();
	};

	const clampBlur =
		(setter: (v: string) => void, max: number) => (val: string) => {
			const num = Math.min(parseInt(val || '0', 10), max);
			setter(pad(num));
		};

	const handleSubmit = (e: React.SyntheticEvent) => {
		e.preventDefault();
		if (totalSeconds > 0) onSubmit(totalSeconds, tableType);
	};

	return (
		<div className='animate-fade-in'>
			<form
				onSubmit={handleSubmit}
				className='max-w-sm mx-auto'
			>
				<div className='flex items-center justify-center gap-4 mb-4'>
					<TimeDigitInput
						id='apnea-pb-minutes'
						label='Min'
						value={minutes}
						max={MAX_MINUTES}
						onChange={handleMinutesChange}
						onBlur={clampBlur(setMinutes, MAX_MINUTES)}
					/>
					<span className='text-3xl font-bold text-foreground/30 mt-6'>:</span>
					<TimeDigitInput
						id='apnea-pb-seconds'
						label='Sec'
						value={seconds}
						max={MAX_SECONDS}
						onChange={setSeconds}
						onBlur={clampBlur(setSeconds, MAX_SECONDS)}
						clampOnInput
						inputRef={secondsRef}
					/>
				</div>

				<div className='flex items-center justify-center gap-4 mb-4 h-5 text-xs text-foreground/40'>
					{preview ? (
						<>
							<span className='w-20 flex items-center justify-center gap-1.5'>
								<RiRepeatLine className='size-3.5' />
								{preview.rounds} rounds
							</span>
							<span
								aria-hidden
								className='text-3xl font-bold text-transparent leading-none'
							>
								:
							</span>
							<span className='w-20 flex items-center justify-center gap-1.5'>
								<RiTimeLine className='size-3.5' />
								{formatTime(preview.duration)}
							</span>
						</>
					) : (
						<span className='text-foreground/20'>Enter your PB</span>
					)}
				</div>

				<TableTypeToggle
					value={tableType}
					onChange={setTableType}
				/>

				<button
					type='submit'
					disabled={totalSeconds === 0}
					className='group relative w-full h-12 rounded-full border border-border bg-neutral-800 font-medium text-sm text-foreground hover:bg-neutral-800/0 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200'
					id='apnea-generate-tables'
				>
					<div className='absolute -bottom-px left-1/2 h-px w-14 -translate-x-1/2 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
					Start Training
				</button>
			</form>
		</div>
	);
}
