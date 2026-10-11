import 'server-only';
import { cacheLife } from 'next/cache';
import type { Accommodation, Branding, CatalogItem, Paginated } from './types';

/**
 * Cliente del backend de samawe. SOLO corre en el servidor (`server-only`): la
 * URL y la `X-Client-Key` nunca llegan al navegador.
 *
 * El backend sabe de qué hotel es cada petición por el HOST al que se llama:
 * `SAMAWE_API_URL` tiene que ser un host registrado para Crazy Love en
 * `organization_domains` (en local `http://127.0.0.2:3000`; en producción su
 * propio `api-…`). Con el host de Samawe, el catálogo sería el de Samawe.
 *
 * No hay login: todo lo que muestra el sitio es público (catálogo y marca).
 */
const API_URL = (process.env.SAMAWE_API_URL ?? '').replace(/\/+$/, '');
const CLIENT_KEY = process.env.SAMAWE_API_CLIENT_KEY ?? '';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function apiGet<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
  if (!API_URL) throw new ApiError(500, 'Falta SAMAWE_API_URL en el entorno.');
  const url = new URL(`${API_URL}/${path.replace(/^\/+/, '')}`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    headers: { 'X-Client-Key': CLIENT_KEY, Accept: 'application/json' },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      message = ((await res.json()) as { message?: string }).message ?? message;
    } catch {
      /* cuerpo no JSON */
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}

/**
 * Marca del hotel (nombre, colores, logo, textos, contacto). Si el backend no
 * responde, `null`: el sitio se pinta con la marca por defecto en vez de caerse
 * (pasa, por ejemplo, al construir sin el backend levantado).
 */
export async function getBranding(): Promise<Branding | null> {
  'use cache';
  cacheLife('minutes');
  try {
    return (await apiGet<{ data: Branding }>('organizational/current')).data;
  } catch (error) {
    console.error('No se pudo cargar la marca del hotel:', (error as Error).message);
    return null;
  }
}

export interface CatalogQuery {
  page?: number;
  perPage?: number;
  search?: string;
}

export async function getProducts(q: CatalogQuery = {}): Promise<Paginated<CatalogItem>> {
  'use cache';
  cacheLife('minutes');
  return apiGet('product/public/list', { ...q });
}

export async function getProduct(id: number): Promise<CatalogItem> {
  'use cache';
  cacheLife('minutes');
  return (await apiGet<{ data: CatalogItem }>(`product/public/${id}`)).data;
}

export async function getServices(q: CatalogQuery = {}): Promise<Paginated<CatalogItem>> {
  'use cache';
  cacheLife('minutes');
  return apiGet('excursion/public/list', { ...q });
}

export async function getService(id: number): Promise<CatalogItem> {
  'use cache';
  cacheLife('minutes');
  return (await apiGet<{ data: CatalogItem }>(`excursion/public/${id}`)).data;
}

/** Hospedajes: el endpoint del backend no tiene búsqueda, solo páginas. */
export async function getAccommodations(
  q: Omit<CatalogQuery, 'search'> = {},
): Promise<Paginated<Accommodation>> {
  'use cache';
  cacheLife('minutes');
  return apiGet('accommodation/public/list', { ...q });
}

export async function getAccommodation(id: number): Promise<Accommodation> {
  'use cache';
  cacheLife('minutes');
  return (await apiGet<{ data: Accommodation }>(`accommodation/public/${id}`)).data;
}
