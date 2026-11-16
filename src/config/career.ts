export type Entry = {
	id: string;
	kind: 'education' | 'work';
	start: string;
	end: string;
	initials: string;
	color: string;
	url?: string;
};

export const entries: Entry[] = [
	{
		id: 'via',
		kind: 'education',
		start: '2022-09',
		end: '2026-01',
		initials: 'V',
		color: '#dc2626',
	},
	{
		id: 'au',
		kind: 'education',
		start: '2026-02',
		end: '2028-01',
		initials: 'AU',
		color: '#1d4ed8',
	},
	{
		id: 'mainai',
		kind: 'work',
		start: '2024-08',
		end: '2025-01',
		initials: 'M',
		color: '#7c3aed',
		url: 'https://mainai.dk',
	},
	{
		id: 'claviate',
		kind: 'work',
		start: '2025-02',
		end: '2026-06',
		initials: 'C',
		color: '#059669',
		url: 'https://www.claviate.com',
	},
	{
		id: 'stibo',
		kind: 'work',
		start: '2025-09',
		end: '2026-01',
		initials: 'S',
		color: '#0284c7',
	},
	{
		id: 'callifyx',
		kind: 'work',
		start: '2025-10',
		end: '2026-01',
		initials: 'C',
		color: '#ea580c',
	},
	{
		id: 'stibo-systems',
		kind: 'work',
		start: '2026-05',
		end: 'present',
		initials: 'S',
		color: '#0284c7',
	},
	{
		id: 'lego',
		kind: 'work',
		start: '2026-08',
		end: 'present',
		initials: 'L',
		color: '#f59e0b',
	},
];
