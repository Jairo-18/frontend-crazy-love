'use client';

import { useLayoutEffect } from 'react';

/**
 * Las páginas de detalle llegan en dos tiempos: primero el esqueleto
 * (`<Suspense>`), después el contenido. Next acomoda el scroll sobre el
 * esqueleto y, al llegar el contenido, la página quedaba a media altura
 * (desde las fotos, con "← Volver" fuera de la vista). Esto la lleva arriba
 * cuando el contenido ya está.
 *
 * Con "atrás/adelante" del navegador no hace nada: ahí lo correcto es volver
 * a donde estaba. El `popstate` llega antes de que se pinte la página nueva.
 */
let lastPop = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    lastPop = Date.now();
  });
}

export function ScrollTopOnEnter() {
  useLayoutEffect(() => {
    if (Date.now() - lastPop < 1500 || window.location.hash) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return null;
}
