'use client';

const DIGITS = 2;

type TimeDigitInputProps = {
	id: string;
	label: string;
	value: string;
	max: number;
	onChange: (val: string) => void;
	onBlur: (val: string) => void;
	clampOnInput?: boolean;
	inputRef?: React.RefObject<HTMLInputElement | null>;
};

export default function TimeDigitInput({
	id,
	label,
	value,
	max,
	onChange,
	onBlur,
	clampOnInput,
	inputRef,
}: TimeDigitInputProps) {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const next = e.target.value.replace(/\D/g, '').slice(0, DIGITS);
		if (clampOnInput && next !== '' && parseInt(next, 10) > max) return;
		onChange(next);
	};

	return (
		<div className='flex flex-col items-center gap-2'>
			<label
				htmlFor={id}
				className='text-xs text-foreground/40 uppercase tracking-wider'
			>
				{label}
			</label>
			<input
				id={id}
				ref={inputRef}
				type='text'
				inputMode='numeric'
				value={value}
				onChange={handleChange}
				onFocus={(e) => e.target.select()}
				onBlur={(e) => onBlur(e.target.value)}
				placeholder='00'
				className='w-20 h-16 text-center text-3xl font-bold bg-neutral-800/80 border border-border rounded-xl text-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary/50 transition-colors'
			/>
		</div>
	);
}
