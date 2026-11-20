import type { Metadata } from 'next';
import '../globals.css';
export const metadata: Metadata = { title: { default: 'FORMA — Editable Document Templates', template: '%s | FORMA' }, description: 'A considered library of editable documents.', robots: { index: false, follow: true } };
export default function EnglishRootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
