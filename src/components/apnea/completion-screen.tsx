'use client';

import { RiCalendarLine, RiCheckLine, RiTimeLine } from 'react-icons/ri';

import {
	type SessionType,
	buildProgramPlan,
	downloadProgramIcs,
} from '@/utils/apnea/apnea-calendar';
import type { ApneaTable } from '@/utils/apnea/apnea-tables';
import { formatTime, totalTableTime } from '@/utils/apnea/apnea-tables';

type CompletionScreenProps = {
	table: ApneaTable;
	totalRounds: number;
	onDone: () => void;
};

export default function CompletionScreen({
	table,
	totalRounds,
	onDone,
}: CompletionScreenProps) {
	const sessionType: SessionType | null =
		table.type === 'co2' || table.type === 'o2' ? table.type : null;
	const plan = sessionType ? buildProgramPlan(sessionType) : null;

	const handleAddToCalendar = () => {
		if (sessionType) downloadProgramIcs(sessionType);
	};

	return (
		<div className='text-center animate-fade-in max-w-sm mx-auto'>
			<div className='flex items-center justify-center size-16 rounded-full border border-border bg-neutral-800/50 mx-auto mb-6'>
				<RiCheckLine className='size-7 text-primary' />
			</div>
			<h2 className='text-xl font-bold text-foreground mb-2'>
				Session Complete
			</h2>
			<p className='text-sm text-foreground/40 mb-1'>{table.name}</p>
			<div className='flex items-center justify-center gap-1.5 text-sm text-foreground/30 mb-8'>
				<RiTimeLine className='size-3.5' />
				<span>{formatTime(totalTableTime(table))}</span>
				<span>·</span>
				<span>{totalRounds} rounds</span>
			</div>

			<button
				type='button'
				onClick={onDone}
				className='group relative w-full h-12 rounded-full border border-border bg-neutral-800 font-medium text-sm text-foreground hover:bg-neutral-800/0 transition-all mb-3'
			>
				<div className='absolute -bottom-px left-1/2 h-px w-14 -translate-x-1/2 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
				Done
			</button>

			{plan && plan.sessions.length > 0 && (
				<button
					type='button'
					onClick={handleAddToCalendar}
					className='inline-flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/70 transition-colors underline-offset-4 hover:underline'
					title={`${plan.trainingCount} training sessions + max-hold test · every ${plan.restHours}h · ${plan.programDays}-day plan`}
				>
					<RiCalendarLine className='size-3.5' />
					Add {plan.programDays}-day plan ({plan.trainingCount} sessions)
				</button>
			)}
		</div>
	);
}
