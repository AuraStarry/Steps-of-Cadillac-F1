import './globals.css';

export const metadata = {
  title: 'Steps of Cadillac F1',
  description: 'Cadillac F1 long-term benchmark tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
