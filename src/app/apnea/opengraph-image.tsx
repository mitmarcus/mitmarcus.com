import { ImageResponse } from 'next/og';

import Logo from '@/components/logo';

export const runtime = 'edge';
export const alt = 'Apnea Trainer - Marcus Mitelea';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				background: '#000000',
				color: 'white',
				fontFamily: 'sans-serif',
			}}
		>
			<Logo
				width={450}
				height={360}
			/>
			<div
				style={{
					fontSize: 35,
					letterSpacing: 9,
					paddingLeft: 18,
					opacity: 0.5,
					marginTop: 12,
				}}
			>
				APNEA TRAINER
			</div>
		</div>,
		{ ...size },
	);
}
