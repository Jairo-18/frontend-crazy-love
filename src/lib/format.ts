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

export function hoursLabel(hours: number): string {
  return `${hours} hora${hours === 1 ? '' : 's'}`;
}

/**
 * Precio a mostrar en una tarjeta de hospedaje: la tarifa más barata, con sus
 * horas. Sin tarifas (no debería pasar) cae al `priceSale`, que es la de 24 h.
 */
export function startingRate(a: {
  priceSale: number;
  rates?: { hours: number; price: number }[];
}): { price: number; hours: number; several: boolean } {
  const rates = a.rates ?? [];
  if (!rates.length) return { price: Number(a.priceSale), hours: 24, several: false };
  const cheapest = rates.reduce((min, r) => (Number(r.price) < Number(min.price) ? r : min));
  return { price: Number(cheapest.price), hours: cheapest.hours, several: rates.length > 1 };
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

/** `tel:` del hotel, para llamar desde el celular. */
export function phoneHref(branding: Branding | null): string | null {
  const phone = branding?.phone?.replace(/\D/g, '');
  if (!phone) return null;
  const code = (branding?.phoneCode?.code ?? '+57').replace(/\D/g, '');
  return `tel:+${phone.startsWith(code) ? phone : code + phone}`;
}

/** Props de precio para la tarjeta de un hospedaje: "Desde $60.000 · 4 horas · hasta 2 personas". */
export function accommodationPrice(a: {
  priceSale: number;
  amountBathroom?: number;
  rates?: { hours: number; price: number }[];
}): { price: number; pricePrefix?: string; detail: string } {
  const r = startingRate(a);
  const people = a.amountBathroom ? ` · hasta ${a.amountBathroom} personas` : '';
  return {
    price: r.price,
    pricePrefix: r.several ? 'Desde' : undefined,
    detail: `${hoursLabel(r.hours)}${people}`,
  };
}
