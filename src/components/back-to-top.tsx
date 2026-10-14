'use client';

import { useEffect, useState } from 'react';
import { ArrowUpIcon } from './icons';

/** Botón "arriba": aparece cuando ya se bajó más de una pantalla y media. */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 1.5);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      // Sin `behavior`: toma el `scroll-behavior` del CSS, que respeta
      // "reducir movimiento" del teléfono.
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Volver arriba"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={`fixed bottom-5 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-lg ring-1 ring-white/20 transition duration-200 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}
