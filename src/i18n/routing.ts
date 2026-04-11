import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'da', 'ro', 'ru'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Don't show /en prefix for the default locale
  localePrefix: 'as-needed'
});
