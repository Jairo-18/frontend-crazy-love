'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Ventanas encima de la página (visor de fotos, hoja de un producto) con un
 * `<dialog>` nativo: foco atrapado y Escape gratis. Además:
 *
 * - **El botón "atrás" del celular la cierra** en vez de salir de la página:
 *   al abrir se agrega una entrada al historial. El `pushState` de Next 16 está
 *   parcheado y copia su estado interno, así que volver no recarga nada.
 * - **El fondo no se desplaza** mientras está abierta.
 *
 * `open(url?)`: con `url` (p. ej. `#ver-producto-12`) la dirección cambia y se
 * puede compartir. `close()` la cierra desde un botón deshaciendo esa entrada.
 * `adopt()`: la ventana se abrió por la dirección al entrar (alguien compartió
 * el enlace): no hay entrada propia que deshacer, al cerrar solo se limpia.
 */
export function useOverlay(onClosed?: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const pushed = useRef(false);
  const adopted = useRef(false);
  const onClosedRef = useRef(onClosed);
  useEffect(() => {
    onClosedRef.current = onClosed;
  });

  const hide = useCallback(() => {
    const d = ref.current;
    if (d?.open) d.close();
    document.documentElement.style.overflow = '';
    onClosedRef.current?.();
  }, []);

  const show = useCallback(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    document.documentElement.style.overflow = 'hidden';
  }, []);

  const open = useCallback(
    (url?: string) => {
      if (!pushed.current && !adopted.current) {
        window.history.pushState({ overlay: true }, '', url);
        pushed.current = true;
      } else if (url) {
        // Ya abierta (se cambia de producto dentro de la hoja): misma entrada.
        window.history.replaceState(window.history.state, '', url);
      }
      show();
    },
    [show],
  );

  const adopt = useCallback(() => {
    adopted.current = true;
    show();
  }, [show]);

  const close = useCallback(() => {
    if (pushed.current) {
      // El `popstate` de abajo la cierra.
      pushed.current = false;
      window.history.back();
      return;
    }
    if (adopted.current) {
      adopted.current = false;
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    }
    hide();
  }, [hide]);

  /**
   * Se sale de la página con la ventana abierta (p. ej. "Abrir como página"):
   * se cierra sin tocar el historial. Sin esto la siguiente página quedaba
   * con `overflow: hidden` en `<html>` y no dejaba hacer scroll. La entrada
   * `#ver-…` queda en el historial: volver desde la otra página reabre la hoja.
   */
  const release = useCallback(() => {
    pushed.current = false;
    adopted.current = false;
    hide();
  }, [hide]);

  // Por si el componente se desmonta abierto (navegación, error…).
  useEffect(
    () => () => {
      document.documentElement.style.overflow = '';
    },
    [],
  );

  useEffect(() => {
    const onPop = () => {
      if (!ref.current?.open) return;
      pushed.current = false;
      adopted.current = false;
      hide();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [hide]);

  // Escape: el `<dialog>` se cerraría solo y el historial quedaría con la
  // entrada de más. Se intercepta y se cierra por el mismo camino.
  const onCancel = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      close();
    },
    [close],
  );

  // Tocar fuera del contenido (el fondo oscuro es el propio `<dialog>`).
  const onBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === e.currentTarget) close();
    },
    [close],
  );

  return { ref, open, adopt, close, release, dialogProps: { ref, onCancel, onClick: onBackdropClick } };
}
