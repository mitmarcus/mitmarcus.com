export type SessionType = 'co2' | 'o2';
export type ProgramSessionKind = SessionType | 'max-test';

const REST_HOURS = 48;
const PROGRAM_DAYS = 14;
const SESSION_DURATION_MINUTES = 20;
const MAX_TEST_DURATION_MINUTES = 30;

const LABEL: Record<ProgramSessionKind, string> = {
	co2: 'CO₂ Table',
	o2: 'O₂ Table',
	'max-test': 'Max Breath-Hold Test',
};

type ProgramSession = {
	kind: ProgramSessionKind;
	when: Date;
};

export type ProgramPlan = {
	sessions: ProgramSession[];
	programDays: number;
	restHours: number;
	trainingCount: number;
	hasTest: boolean;
};

export function buildProgramPlan(justCompleted: SessionType): ProgramPlan {
	const now = Date.now();
	const programEnd = now + PROGRAM_DAYS * 24 * 3600 * 1000;
	const sessions: ProgramSession[] = [];
	let current: SessionType = justCompleted;
	let t = now + REST_HOURS * 3600 * 1000;
	while (t <= programEnd) {
		current = current === 'co2' ? 'o2' : 'co2';
		sessions.push({ kind: current, when: new Date(t) });
		t += REST_HOURS * 3600 * 1000;
	}
	const trainingCount = sessions.length;
	if (trainingCount > 0) {
		const lastTraining = sessions[trainingCount - 1].when.getTime();
		sessions.push({
			kind: 'max-test',
			when: new Date(lastTraining + REST_HOURS * 3600 * 1000),
		});
	}
	return {
		sessions,
		programDays: PROGRAM_DAYS,
		restHours: REST_HOURS,
		trainingCount,
		hasTest: trainingCount > 0,
	};
}

function formatIcsDate(d: Date): string {
	return d
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}/, '');
}

function escapeIcsText(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,');
}

function plainLabel(kind: ProgramSessionKind): string {
	return LABEL[kind].replace('₂', '2');
}

function sessionDurationMinutes(kind: ProgramSessionKind): number {
	return kind === 'max-test'
		? MAX_TEST_DURATION_MINUTES
		: SESSION_DURATION_MINUTES;
}

function buildVevent(
	session: ProgramSession,
	index: number,
	siteUrl: string,
	stamp: string,
): string[] {
	const end = new Date(
		session.when.getTime() + sessionDurationMinutes(session.kind) * 60 * 1000,
	);
	const uid = `apnea-${Date.now()}-${index}@mitmarcus.com`;
	const label = plainLabel(session.kind);
	const summary =
		session.kind === 'max-test'
			? `Apnea - ${label}`
			: `Apnea Training - ${label}`;
	const descriptionText =
		session.kind === 'max-test'
			? `Max breath-hold attempt. Retest your PB and update the trainer. Open: ${siteUrl}`
			: `Apnea session: ${label}. Open trainer: ${siteUrl}`;
	return [
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${stamp}`,
		`DTSTART:${formatIcsDate(session.when)}`,
		`DTEND:${formatIcsDate(end)}`,
		`SUMMARY:${summary}`,
		`DESCRIPTION:${escapeIcsText(descriptionText)}`,
		`URL:${siteUrl}`,
		'END:VEVENT',
	];
}

export function buildProgramIcs(
	justCompleted: SessionType,
	siteUrl: string,
): { filename: string; content: string } {
	const { sessions } = buildProgramPlan(justCompleted);
	const stamp = formatIcsDate(new Date());
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//mitmarcus.com//Apnea Trainer//EN',
		'CALSCALE:GREGORIAN',
		...sessions.flatMap((s, i) => buildVevent(s, i, siteUrl, stamp)),
		'END:VCALENDAR',
	];
	return {
		filename: `apnea-program-${PROGRAM_DAYS}d.ics`,
		content: lines.join('\r\n'),
	};
}

export function downloadProgramIcs(justCompleted: SessionType): void {
	if (typeof window === 'undefined') return;
	const siteUrl = window.location.origin + window.location.pathname;
	const { filename, content } = buildProgramIcs(justCompleted, siteUrl);
	const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
