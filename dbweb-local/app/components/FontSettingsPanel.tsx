import {
  EDITOR_FONTS,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  UI_FONTS,
  type FontSettings,
} from "~/utils/settings";
import { inputClass, labelClass } from "./form";

interface FontSettingsPanelProps {
  font: FontSettings;
  updateFont: (partial: Partial<FontSettings>) => void;
}

export function FontSettingsPanel({ font, updateFont }: FontSettingsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <FontGroup
        title="App UI"
        fonts={UI_FONTS}
        font={font.uiFont}
        size={font.uiFontSize}
        preview="The quick brown fox / 素早い茶色の狐"
        onFont={(uiFont) => updateFont({ uiFont })}
        onSize={(uiFontSize) => updateFont({ uiFontSize })}
      />
      <FontGroup
        title="SQL Editor & Results"
        fonts={EDITOR_FONTS}
        font={font.editorFont}
        size={font.editorFontSize}
        preview="SELECT * FROM users WHERE id = 1;"
        onFont={(editorFont) => updateFont({ editorFont })}
        onSize={(editorFontSize) => updateFont({ editorFontSize })}
      />
    </div>
  );
}

function FontGroup({
  title,
  fonts,
  font,
  size,
  preview,
  onFont,
  onSize,
}: {
  title: string;
  fonts: readonly string[];
  font: string;
  size: number;
  preview: string;
  onFont: (font: string) => void;
  onSize: (size: number) => void;
}) {
  return (
    <fieldset className="rounded border border-gray-200 p-3 dark:border-gray-800">
      <legend className="px-1 text-xs font-semibold">{title}</legend>
      <div className="flex flex-col gap-2">
        <label className={labelClass}>
          font
          <select
            value={font}
            onChange={(e) => onFont(e.target.value)}
            className={inputClass}
          >
            {fonts.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          font-size: {size}px
          <input
            type="range"
            min={FONT_SIZE_MIN}
            max={FONT_SIZE_MAX}
            value={size}
            onChange={(e) => onSize(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <p
          className="rounded bg-gray-50 px-2 py-1 dark:bg-gray-900"
          style={{ fontFamily: `"${font}"`, fontSize: `${size}px` }}
        >
          {preview}
        </p>
      </div>
    </fieldset>
  );
}
