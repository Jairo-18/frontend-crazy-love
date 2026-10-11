import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getBranding } from '@/lib/api';
import { mediaUrl, t } from '@/lib/format';
import type { Branding } from '@/lib/types';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  const name = branding?.name ?? 'Catálogo';
  const logo = mediaUrl(branding, 'LOGO');
  return {
    title: { default: t(branding?.metaTitle, name), template: `%s | ${name}` },
    description: t(branding?.metaDescription, t(branding?.description)),
    icons: logo ? { icon: logo } : undefined,
  };
}

/** Solo los colores que el hotel definió; el resto queda en el valor de `globals.css`. */
function brandingStyle(b: Branding | null): CSSProperties {
  const vars: Record<string, string | undefined> = {
    '--brand': b?.primaryColor,
    '--brand-2': b?.secondaryColor,
    '--title': b?.titleColor,
    '--text': b?.textColor,
    '--surface-2': b?.bgSecondaryColor,
  };
  return Object.fromEntries(
    Object.entries(vars).filter(([, v]) => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v)),
  ) as CSSProperties;
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const branding = await getBranding();
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col" style={brandingStyle(branding)}>
        <SiteHeader branding={branding} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <SiteFooter branding={branding} />
      </body>
    </html>
  );
}
