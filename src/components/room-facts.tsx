import { t } from '@/lib/format';
import type { Accommodation } from '@/lib/types';
import { BathIcon, BedIcon, CarIcon, MotoIcon, PeopleIcon, type IconProps } from './icons';

export type RoomFact = { icon: (p: IconProps) => React.ReactNode; label: string };

/**
 * Lo que trae una habitación, con ícono. Sin directiva: la usan la tarjeta
 * (cliente) y el detalle (servidor). `withBed` agrega la cama, que en la
 * tarjeta sobra.
 */
export function roomFacts(a: Accommodation, withBed = false): RoomFact[] {
  return [
    a.amountBathroom ? { icon: PeopleIcon, label: `Hasta ${a.amountBathroom} personas` } : null,
    a.jacuzzi ? { icon: BathIcon, label: 'Jacuzzi' } : null,
    withBed && a.bedType ? { icon: BedIcon, label: `Cama ${t(a.bedType.name).toLowerCase()}` } : null,
    a.hasCarParking ? { icon: CarIcon, label: 'Parqueadero carro' } : null,
    a.hasMotorcycleParking ? { icon: MotoIcon, label: 'Parqueadero moto' } : null,
  ].filter(Boolean) as RoomFact[];
}
