import { useCallback, useEffect, useRef, useState } from "react";

export interface PanZoomView {
  scale: number;
  x: number;
  y: number;
}

const INITIAL_VIEW: PanZoomView = { scale: 1, x: 0, y: 0 };
const SCALE_MIN = 0.1;
const SCALE_MAX = 5;

function clampScale(scale: number): number {
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale));
}

/**
 * Wheel-zoom and drag-pan for a container element. Attach `containerRef`
 * and the pointer handlers to the container, and apply `view` as a CSS
 * transform on the content.
 */
export function usePanZoom() {
  const [view, setView] = useState<PanZoomView>(INITIAL_VIEW);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; base: PanZoomView } | null>(
    null
  );

  // React registers wheel listeners as passive, so preventDefault (needed to
  // stop page scroll while zooming) requires a manual non-passive listener.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => ({ ...v, scale: clampScale(v.scale * Math.exp(-e.deltaY * 0.001)) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startY: e.clientY, base: view };
    },
    [view]
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    setView((v) => ({
      ...v,
      x: drag.base.x + e.clientX - drag.startX,
      y: drag.base.y + e.clientY - drag.startY,
    }));
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const zoomBy = useCallback((factor: number) => {
    setView((v) => ({ ...v, scale: clampScale(v.scale * factor) }));
  }, []);

  const reset = useCallback(() => setView(INITIAL_VIEW), []);

  return {
    containerRef,
    view,
    pointerHandlers: { onPointerDown, onPointerMove, onPointerUp },
    zoomBy,
    reset,
  };
}
