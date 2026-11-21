export const locales = ['en', 'uk'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export function localizedPath(locale: Locale, path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return locale === 'en' ? normalized : `/uk${normalized === '/' ? '' : normalized}`;
}
export const dictionary = {
  en: {
    templates: 'All templates', categories: 'Categories',
    search: 'Search', searchPlaceholder: 'Search document templates',
    homeTitle: 'Documents worth using.',
    homeText: 'A considered library of editable documents for work and everyday life.',
    browse: 'Browse templates', featured: 'Browse by category',
    catalogTitle: 'All templates', catalogDescription: 'Explore editable documents by format and purpose.',
    categoriesTitle: 'Categories', categoriesDescription: 'Find a document for the task at hand.',
    searchTitle: 'Search templates', detail: 'Template details',
    noData: 'The live catalog is not connected yet. Published templates will appear here after the backend API is integrated.',
    noDetail: 'Template data is not available yet.',
    preview: 'Quick preview', fullDetails: 'View full details', download: 'Download', close: 'Close',
    privacy: 'Privacy', terms: 'Terms', about: 'About',
    footer: 'Editable documents, thoughtfully organized.',
    pageNotFound: 'Page not found', back: 'Back to homepage',
  },
  uk: {
    templates: 'Усі шаблони', categories: 'Категорії',
    search: 'Пошук', searchPlaceholder: 'Пошук шаблонів документів',
    homeTitle: 'Документи, якими зручно користуватися.',
    homeText: 'Ретельно впорядкована бібліотека редагованих документів для роботи й повсякденних справ.',
    browse: 'Переглянути шаблони', featured: 'Огляд категорій',
    catalogTitle: 'Усі шаблони', catalogDescription: 'Шукайте редаговані документи за форматом і призначенням.',
    categoriesTitle: 'Категорії', categoriesDescription: 'Знайдіть документ для свого завдання.',
    searchTitle: 'Пошук шаблонів', detail: 'Інформація про шаблон',
    noData: 'Каталог поки не підключений. Опубліковані шаблони з’являться після інтеграції з API backend.',
    noDetail: 'Дані шаблону поки недоступні.',
    preview: 'Швидкий перегляд', fullDetails: 'Повна інформація', download: 'Завантажити', close: 'Закрити',
    privacy: 'Конфіденційність', terms: 'Умови', about: 'Про проєкт',
    footer: 'Редаговані документи у продуманій бібліотеці.',
    pageNotFound: 'Сторінку не знайдено', back: 'На головну',
  },
} as const;
