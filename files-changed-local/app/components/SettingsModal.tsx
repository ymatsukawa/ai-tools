import { useEffect, useRef } from "react";
import {
  CODE_FONTS,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  UI_FONTS,
  type FontOption,
  type FontSettings,
} from "~/hooks/useFontSettings";

interface SettingsModalProps {
  settings: FontSettings;
  update: (patch: Partial<FontSettings>) => void;
  reset: () => void;
  onClose: () => void;
}

export function SettingsModal({
  settings,
  update,
  reset,
  onClose,
}: SettingsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current.close();
      }}
      aria-labelledby="font-settings-title"
      className="m-auto w-96 rounded-lg border border-[#d0d7de] bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="p-5">
        <h2
          id="font-settings-title"
          className="mb-4 text-base font-semibold text-[#1f2328]"
        >
          Font settings
        </h2>

        <div className="flex flex-col gap-4">
          <FontSelect
            label="UI font"
            options={UI_FONTS}
            value={settings.uiFont}
            onChange={(uiFont) => update({ uiFont })}
          />
          <SizeSlider
            label="UI scale (base font size)"
            value={settings.uiSize}
            onChange={(uiSize) => update({ uiSize })}
          />
          <FontSelect
            label="Code font"
            options={CODE_FONTS}
            value={settings.codeFont}
            onChange={(codeFont) => update({ codeFont })}
          />
          <SizeSlider
            label="Code font size"
            value={settings.codeSize}
            onChange={(codeSize) => update({ codeSize })}
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-1.5 text-sm font-medium text-[#1f2328] hover:bg-[#eef1f4]"
          >
            Reset to defaults
          </button>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-md bg-[#1f883d] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1a7f37]"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

function FontSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FontOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[#1f2328]">
      <span className="font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-[#d0d7de] bg-white px-2 py-1.5 text-sm focus:border-[#0969da] focus:outline-none"
      >
        {options.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SizeSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (size: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-[#1f2328]">
      <span className="flex items-baseline justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-[#57606a]">{value} px</span>
      </span>
      <input
        type="range"
        min={MIN_FONT_SIZE}
        max={MAX_FONT_SIZE}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-[#1f883d]"
      />
    </label>
  );
}
