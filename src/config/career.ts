export type Entry = {
	id: string;
	kind: 'education' | 'work';
	start: string;
	end: string;
	initials: string;
	color: string;
	logo?: string;
	side?: boolean;
	accent?: string;
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
		color: '#000000',
		logo: '/career/mainai.png',
		url: 'https://mainai.dk',
	},
	{
		id: 'claviate',
		kind: 'work',
		start: '2025-02',
		end: '2026-06',
		initials: 'C',
		color: '#00446b',
		logo: '/career/claviate.png',
		url: 'https://www.claviate.com',
	},
	{
		id: 'stibo',
		kind: 'work',
		start: '2025-09',
		end: '2026-01',
		initials: 'S',
		color: '#00abc1',
		logo: '/career/stibo.svg',
	},
	{
		id: 'callifyx',
		kind: 'work',
		side: true,
		start: '2025-10',
		end: '2026-01',
		initials: 'C',
		color: '#000000',
		logo: '/career/callifyx.jpeg',
		accent: '#0cfa8b',
	},
	{
		id: 'stibo-systems',
		kind: 'work',
		start: '2026-05',
		end: 'present',
		initials: 'S',
		color: '#00abc1',
		logo: '/career/stibo.svg',
	},
	{
		id: 'athme',
		kind: 'work',
		side: true,
		start: '2026-05',
		end: 'present',
		initials: 'A',
		color: '#06263d',
		logo: '/career/athme.png',
		url: 'https://www.athmeapp.eu',
	},
	{
		id: 'lego',
		kind: 'work',
		start: '2026-08',
		end: 'present',
		initials: 'L',
		color: '#e3000b',
		logo: '/career/lego.png',
	},
];
