'use client';

import { useTranslations } from 'next-intl';
import { RiTranslate2 } from 'react-icons/ri';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	defaultLocale,
	locales,
	usePathname,
	useRouter,
} from '@/lib/navigation';

const LanguageDropdown = () => {
	const t = useTranslations('common');

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className='hidden rounded p-2 text-foreground/70 outline-none transition-colors hover:bg-accent/60 hover:text-foreground sm:block'>
				<span className='sr-only'>{t('chooseLanguage')}</span>
				<RiTranslate2 className='size-4' />
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				{locales.map((locale) => (
					<LanguageMenuItem
						key={locale}
						locale={locale}
					/>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const LanguageMenuItem = ({ locale }: { locale: Locale }) => {
	const { replace } = useRouter();
	const pathname = usePathname();

	// Define locale display names
	const getLanguageName = (locale: Locale) => {
		switch (locale) {
			case 'en':
				return 'English';
			case 'ro':
				return 'Română'; // Romanian
			case 'ru':
				return 'Русский'; // Russian
			case 'da':
				return 'Dansk'; // Danish
			default:
				return 'English';
		}
	};

	return (
		<DropdownMenuItem
			className='rounded px-2 py-1.5'
			onClick={() => replace(pathname!, { locale })}
		>
			{getLanguageName(locale)}
		</DropdownMenuItem>
	);
};

export { LanguageDropdown as default, LanguageMenuItem };
