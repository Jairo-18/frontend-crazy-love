'use client';

import { useEffect } from 'react';

/**
 * Lleva al ancla de la dirección (`/#carta-bar`) cuando la carta ya está
 * pintada. Next intenta hacerlo al navegar, pero la carta llega después
 * (`<Suspense>`): el ancla aún no existía y "Volver a la carta" dejaba la
 * página arriba. Va dentro de la carta, así que corre cuando ya está.
 * `#ver-…` es la hoja de un producto: de eso se encarga `ItemSheetProvider`.
 */
export function ScrollToHash() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || id.startsWith('ver-')) return;
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, []);
  return null;
}
