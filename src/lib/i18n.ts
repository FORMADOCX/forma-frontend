export const locales = ['en', 'uk'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export function localizedPath(locale: Locale, path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return locale === 'en' ? normalized : `/uk${normalized === '/' ? '' : normalized}`;
}
export const dictionary = {
  en: {
    howEyebrow: 'THE FORMA METHOD', howTitle: 'The right document. A simpler way.', howText: 'Explore with confidence, see the document before you commit, and choose the file that works for you.', howExplore: 'Explore all templates', howFind: 'Find', howFindText: 'Search templates or browse categories.', howPreview: 'Preview', howPreviewText: 'Review the document before downloading.', howDownload: 'Download', howDownloadText: 'Choose an available format and get your file.', allCategories: 'All Categories',
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
    howEyebrow: 'ЯК ПРАЦЮЄ FORMA', howTitle: 'Потрібний документ. Простий шлях.', howText: 'Знайдіть шаблон, перегляньте документ перед вибором і завантажте потрібний формат.', howExplore: 'Переглянути всі шаблони', howFind: 'Знайдіть', howFindText: 'Шукайте шаблони або переглядайте категорії.', howPreview: 'Перегляньте', howPreviewText: 'Ознайомтеся з документом перед завантаженням.', howDownload: 'Завантажте', howDownloadText: 'Виберіть доступний формат і отримайте файл.', allCategories: 'Усі категорії',
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
