import {
	RiCameraLensFill,
	RiGithubFill,
	RiLinkedinBoxFill,
} from 'react-icons/ri';

import Link from '@/components/ui/link';
import { siteConfig } from '@/config/site';

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className='layout'>
			<div className='flex flex-col items-center justify-between gap-4 pb-12 pt-24 sm:flex-row'>
				<div className='text-sm text-foreground'>
					© {currentYear} Marcus Mitelea. All rights reserved.
				</div>
				<div className='flex items-center gap-2'>
					<Link
						href={siteConfig.instaUrl}
						aria-label='photos'
					>
						<RiCameraLensFill className='size-6 opacity-50' />
					</Link>
					<Link
						href={siteConfig.links.github}
						aria-label='github'
					>
						<RiGithubFill className='size-6' />
					</Link>
					<Link
						href={siteConfig.links.linkedin}
						aria-label='linkedin'
					>
						<RiLinkedinBoxFill className='size-6' />
					</Link>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
