import type { Branding, Translated } from './types';

/** El texto en español; si falta, el primero que haya. */
export function t(value: Translated, fallback = ''): string {
  if (!value) return fallback;
  return value.es || Object.values(value).find(Boolean) || fallback;
}

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCop(value: number | string | null | undefined): string {
  return COP.format(Number(value ?? 0));
}

/** Imagen de la marca por código de ranura (`LOGO`, `HOME_BG`, …), la activa de mayor prioridad. */
export function mediaUrl(branding: Branding | null, code: string): string | null {
  const found = (branding?.medias ?? [])
    .filter((m) => m.isActive && m.mediaType?.code === code && m.url)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))[0];
  return found?.url ?? null;
}

/** `wa.me` necesita el número con indicativo y solo dígitos. */
export function whatsappUrl(branding: Branding | null): string | null {
  const phone = branding?.phone?.replace(/\D/g, '');
  if (!phone) return null;
  const code = (branding?.phoneCode?.code ?? '+57').replace(/\D/g, '');
  return `https://wa.me/${phone.startsWith(code) ? phone : code + phone}`;
}
