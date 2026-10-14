'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Barra fija de secciones con la pastilla de la sección visible resaltada.
 * Al bajar por la carta (43 productos) se sabe en qué categoría se está, y la
 * barra se corre sola para que la pastilla activa no quede fuera de pantalla.
 */

/** Alto del header (60) + la barra (~65) + un margen: lo que tapa lo fijo. */
const STICKY_OFFSET = 140;

export function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - STICKY_OFFSET <= 0) current = id;
      }
      // Al fondo de la página la última sección puede no llegar arriba.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && items.length) current = items[items.length - 1].id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  // Centra la pastilla activa dentro de la barra (solo en horizontal: con
  // `scrollIntoView` la página también daba un salto vertical).
  useEffect(() => {
    const nav = navRef.current;
    const chip = active ? nav?.querySelector<HTMLElement>(`[data-target="${active}"]`) : null;
    if (!nav || !chip) return;
    nav.scrollTo({ left: chip.offsetLeft - nav.clientWidth / 2 + chip.offsetWidth / 2, behavior: 'smooth' });
  }, [active]);

  return (
    <nav
      ref={navRef}
      aria-label="Secciones"
      className="sticky top-[60px] z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-[var(--title)]/10 bg-[var(--page)]/90 px-4 py-2.5 backdrop-blur [scrollbar-width:none]"
    >
      {items.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          data-target={id}
          aria-current={active === id ? 'location' : undefined}
          className="nav-chip"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
