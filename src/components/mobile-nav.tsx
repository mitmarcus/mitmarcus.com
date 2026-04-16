import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { RiCloseFill, RiMenuFill } from 'react-icons/ri';

import { LanguageMenuItem } from '@/components/language-dropdown';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import navLinks from '@/config/nav-links';
import { locales } from '@/lib/navigation';

const MobileNav = () => {
	const t = useTranslations('common');
	const [isOpen, setIsOpen] = useState(false);
	const Icon = isOpen ? RiCloseFill : RiMenuFill;

	return (
		<DropdownMenu onOpenChange={(value) => setIsOpen(value)}>
			<DropdownMenuTrigger
				className='group block rounded-full bg-neutral-800 p-2 outline-hidden sm:hidden'
				aria-label={isOpen ? t('closeMenu') : t('openMenu')}
			>
				<Icon className='size-5 text-foreground/70 transition-colors group-hover:text-foreground' />
			</DropdownMenuTrigger>
			<DropdownMenuContent className='min-w-32' align='end'>
				{navLinks.map((link) => (
					<DropdownMenuItem key={link.title} asChild>
						<Link className='w-full gap-2 rounded px-2 py-1.5' href={link.href}>
							{link.icon}
							{t(link.title)}
						</Link>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuLabel className='font-normal text-foreground/60'>
					{t('translations')}
				</DropdownMenuLabel>
				{locales.map((locale) => (
					<LanguageMenuItem key={locale} locale={locale} />
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default MobileNav;
