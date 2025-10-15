import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers/Providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomTabs } from '@/components/layout/BottomTabs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Resonant - Deutsche Gitarren Marketplace',
  description:
    'Die vertrauenswürdige Plattform für Gitarren, Amps und Zubehör in Deutschland',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <div className="pb-14 md:pb-0">
              <Footer />
            </div>
            <BottomTabs />
          </div>
        </Providers>
      </body>
    </html>
  );
}

