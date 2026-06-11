import { useCallback, useEffect } from "react";
import { useErDiagramSvg } from "~/hooks/useErDiagramSvg";
import { usePanZoom } from "~/hooks/usePanZoom";
import { downloadBlob } from "~/utils/download";
import { DownloadIcon } from "./icons";

interface ErDiagramProps {
  code: string;
  downloadName: string;
}

/** Mermaid erDiagram viewer with wheel zoom, drag pan, and SVG download. */
export function ErDiagram({ code, downloadName }: ErDiagramProps) {
  const { svg, error } = useErDiagramSvg(code);
  const { containerRef, view, pointerHandlers, zoomBy, reset } = usePanZoom();

  // A newly rendered diagram starts from the unzoomed origin
  useEffect(() => {
    reset();
  }, [svg, reset]);

  const download = useCallback(() => {
    if (!svg) return;
    const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + svg], {
      type: "image/svg+xml",
    });
    downloadBlob(blob, downloadName);
  }, [svg, downloadName]);

  if (error) {
    return (
      <div className="m-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        Failed to render the ER diagram: {error}
      </div>
    );
  }
  if (!svg) {
    return <p className="p-4 text-sm text-gray-500">Rendering diagram…</p>;
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <DiagramControls zoomBy={zoomBy} onReset={reset} onDownload={download} />
      <div
        ref={containerRef}
        {...pointerHandlers}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
      >
        <div
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: "0 0",
          }}
          className="inline-block p-4"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}

const zoomButtonClass =
  "h-7 w-7 rounded border border-gray-300 bg-white text-sm shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800";

function DiagramControls({
  zoomBy,
  onReset,
  onDownload,
}: {
  zoomBy: (factor: number) => void;
  onReset: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
      <button type="button" onClick={() => zoomBy(1.25)} className={zoomButtonClass} title="Zoom in">
        +
      </button>
      <button type="button" onClick={() => zoomBy(0.8)} className={zoomButtonClass} title="Zoom out">
        −
      </button>
      <button type="button" onClick={onReset} className={zoomButtonClass} title="Reset view">
        1:1
      </button>
      <button
        type="button"
        onClick={onDownload}
        className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1 text-xs shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        title="Download as SVG"
      >
        <DownloadIcon className="h-3.5 w-3.5" />
        SVG
      </button>
    </div>
  );
}
