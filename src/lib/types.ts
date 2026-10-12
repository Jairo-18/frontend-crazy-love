/** Texto traducible tal como lo guarda el backend: `{ es: '...', en: '...' }`. */
export type Translated = Record<string, string> | null | undefined;

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface CategoryType {
  categoryTypeId: number;
  code: string;
  name: Translated;
}

/** Producto o servicio del catálogo público (`/product/public`, `/excursion/public`). */
export interface CatalogItem {
  id: number;
  code: string | null;
  name: Translated;
  description: Translated;
  priceSale: number;
  taxPercentage: number | null;
  categoryType: CategoryType | null;
  images: { imageUrl: string }[];
}

/** Hospedaje del catálogo público (`/accommodation/public`). */
export interface AccommodationRate {
  hours: number;
  price: number;
}

export interface Accommodation {
  accommodationId: number;
  code?: string;
  name: Translated;
  description: Translated;
  amountPerson: number;
  amountRoom: number;
  /** Ojo: en el backend es el MÁXIMO de personas, no baños. */
  amountBathroom: number;
  jacuzzi: boolean;
  priceSale: number;
  extraPersonPrice?: number;
  hasMotorcycleParking?: boolean;
  hasCarParking?: boolean;
  /** Tarifas por horas de estadía, ordenadas por horas (Crazy Love: 4, 8, 12…). */
  rates?: AccommodationRate[];
  categoryType: CategoryType | null;
  bedType: { bedTypeId: number; code: string; name: Translated } | null;
  stateType: { stateTypeId: number; code: string; name: Translated } | null;
  images: { imageUrl: string }[];
}

export interface OrganizationMedia {
  url: string;
  label?: string;
  priority: number;
  isActive: boolean;
  mediaType: { code: string; name: Translated } | null;
}

/** Marca y contenido del hotel (`/organizational/current`, resuelto por host). */
export interface Branding {
  organizationalId: string;
  name: string;
  legalName?: string;
  slug: string;
  email?: string;
  phone?: string;
  phoneCode?: { code?: string } | null;
  website?: string;
  address?: string;
  city?: string;
  department?: string;
  description?: Translated;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  textColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  bgPrimaryColor?: string;
  bgSecondaryColor?: string;
  darkTitleColor?: string;
  darkSubtitleColor?: string;
  darkTextColor?: string;
  darkBgPrimaryColor?: string;
  darkBgSecondaryColor?: string;
  homeTitle?: Translated;
  homeDescription?: Translated;
  accommodationsTitle?: Translated;
  accommodationsDescription?: Translated;
  mapsUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  metaTitle?: Translated;
  metaDescription?: Translated;
  medias: OrganizationMedia[];
}
