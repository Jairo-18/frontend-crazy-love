import { connection } from 'next/server';
import { getBranding } from '@/lib/api';
import { mediaUrl } from '@/lib/format';

/**
 * Ícono de la pestaña: el LOGO del hotel (del backend), recortado en círculo.
 *
 * Es una ruta y no la metadata del layout porque esa se arma en el BUILD, sin
 * backend: quedaba sin ícono y el navegador mostraba el globo gris. Esta se
 * resuelve en cada visita (con la caché de `api.ts`).
 *
 * SVG con el logo INCRUSTADO (data URI): un SVG usado como ícono no carga
 * imágenes externas, y el logo suele ser `.webp`. Sin logo: un círculo con el
 * color de la marca.
 */
export async function GET(): Promise<Response> {
  // En cada visita, no en el build (ahí no hay backend y quedaría el círculo de respaldo).
  await connection();
  const branding = await getBranding();
  const logo = mediaUrl(branding, 'LOGO');
  const brand = /^#[0-9a-f]{3,8}$/i.test(branding?.primaryColor ?? '') ? branding!.primaryColor! : '#be123c';

  let image = '';
  if (logo) {
    try {
      const res = await fetch(logo);
      const type = res.headers.get('content-type') ?? '';
      if (res.ok && type.startsWith('image/')) {
        const data = Buffer.from(await res.arrayBuffer()).toString('base64');
        image = `<image href="data:${type};base64,${data}" width="64" height="64" preserveAspectRatio="xMidYMid slice" clip-path="url(#c)"/>`;
      }
    } catch {
      /* sin logo: queda el círculo de color */
    }
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<defs><clipPath id="c"><circle cx="32" cy="32" r="32"/></clipPath></defs>` +
    `<circle cx="32" cy="32" r="32" fill="${image ? '#ffffff' : brand}"/>` +
    image +
    `</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    },
  });
}
