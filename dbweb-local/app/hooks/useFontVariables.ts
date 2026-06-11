import { useEffect } from "react";
import type { FontSettings } from "~/utils/settings";

const UI_FALLBACK = "ui-sans-serif, system-ui, sans-serif";
const EDITOR_FALLBACK = "ui-monospace, monospace";

export function useFontVariables(font: FontSettings) {
  useEffect(() => {
    const style = document.documentElement.style;
    style.setProperty("--app-font", `"${font.uiFont}", ${UI_FALLBACK}`);
    style.setProperty("--app-font-size", `${font.uiFontSize}px`);
    style.setProperty("--editor-font", `"${font.editorFont}", ${EDITOR_FALLBACK}`);
    style.setProperty("--editor-font-size", `${font.editorFontSize}px`);
  }, [font.uiFont, font.uiFontSize, font.editorFont, font.editorFontSize]);
}
