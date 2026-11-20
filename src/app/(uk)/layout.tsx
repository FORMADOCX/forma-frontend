import type { Metadata } from 'next';
import '../globals.css';
export const metadata: Metadata = { title: { default: 'FORMA — Редаговані шаблони документів', template: '%s | FORMA' }, robots: { index: false, follow: true } };
export default function UkrainianRootLayout({children}:{children:React.ReactNode}) {return <html lang="uk"><body>{children}</body></html>}
