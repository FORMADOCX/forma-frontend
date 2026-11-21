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
    homeTitle: 'FORMA — Editable Document Templates for Work & Life',
    homeText: 'Explore thoughtfully designed, editable document templates for business and everyday needs. Preview documents and download available Word, Excel or PDF files.',
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
    homeTitle: 'FORMA — Редаговані шаблони документів для роботи й життя',
    homeText: 'Знаходьте продумані редаговані шаблони документів для бізнесу та щоденних потреб. Переглядайте документи й завантажуйте доступні формати Word, Excel або PDF.',
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
