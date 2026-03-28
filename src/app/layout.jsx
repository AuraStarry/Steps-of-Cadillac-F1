import './globals.css';
import { Barlow_Condensed, Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-heading',
});

export const metadata = {
  title: 'Steps of Cadillac F1',
  description: 'Cadillac F1 long-term benchmark tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant" className={`${montserrat.variable} ${barlowCondensed.variable}`}>
      <body>{children}</body>
    </html>
  );
}
