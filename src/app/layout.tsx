import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';
import { getBranding } from '@/lib/api';
import { mediaUrl, t } from '@/lib/format';
import type { Branding } from '@/lib/types';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
/** Títulos y nombres: una serifa de carta de noche, para que no parezca un listado. */
const display = Playfair_Display({ variable: '--font-playfair', subsets: ['latin'], weight: ['500', '600', '700'] });

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding();
  const name = branding?.name ?? 'Catálogo';
  const logo = mediaUrl(branding, 'LOGO');
  return {
    title: { default: t(branding?.metaTitle, name), template: `%s | ${name}` },
    description: t(branding?.metaDescription, t(branding?.description)),
    // Pestaña: `/brand-icon`, el logo del hotel en círculo, resuelto en cada
    // visita (esta metadata se arma en el build, sin backend: con la URL del
    // logo aquí quedaba sin ícono y salía el globo gris). iPhone no acepta SVG:
    // el logo tal cual.
    icons: {
      icon: [{ url: '/brand-icon', type: 'image/svg+xml' }],
      shortcut: '/brand-icon',
      ...(logo && { apple: logo }),
    },
  };
}

const isHex = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v);

function cssVars(vars: Record<string, string | undefined>): string {
  return Object.entries(vars)
    .filter(([, v]) => isHex(v))
    .map(([k, v]) => `${k}:${v};`)
    .join('');
}

/**
 * Colores del hotel (Aplicación → Apariencia en el panel), en claro y en
 * oscuro. El oscuro sigue al teléfono del cliente (`prefers-color-scheme`).
 * Lo que el hotel no definió queda en los valores de `globals.css`. Va en un
 * `<style>` y no como estilo en línea: uno en línea le ganaría al `@media`.
 * Solo pasan colores `#hex` validados, así que no hay forma de inyectar CSS.
 */
function brandingCss(b: Branding | null): string {
  const light = cssVars({
    '--brand': b?.primaryColor,
    '--brand-2': b?.secondaryColor,
    '--accent': b?.tertiaryColor,
    '--title': b?.titleColor,
    '--text': b?.textColor,
    '--muted': b?.subtitleColor,
    '--surface': b?.bgPrimaryColor,
    '--surface-2': b?.bgSecondaryColor,
  });
  const dark = cssVars({
    '--title': b?.darkTitleColor,
    '--text': b?.darkTextColor,
    '--muted': b?.darkSubtitleColor,
    '--surface': b?.darkBgPrimaryColor,
    '--surface-2': b?.darkBgPrimaryColor,
    '--page': b?.darkBgSecondaryColor,
  });
  return `:root{${light}}@media (prefers-color-scheme: dark){:root{${dark}}}`;
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const branding = await getBranding();
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <style>{brandingCss(branding)}</style>
        <SiteHeader branding={branding} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <SiteFooter branding={branding} />
      </body>
    </html>
  );
}
