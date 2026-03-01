import "../globals.css"; 
import Navbar from '../components/Navbar/Navbar'; 
import ThemeRegistry from '../ThemeRegistry';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const direction = lang === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <html lang={lang} dir={direction}>
      <body>
        <ThemeRegistry>
          <Navbar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}