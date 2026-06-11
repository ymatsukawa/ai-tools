export const labelClass =
  "block text-xs font-medium text-gray-600 dark:text-gray-400";

export const inputClass =
  "w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900";

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "password";
  placeholder?: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

export function RadioGroup<T extends string | boolean>({
  legend,
  name,
  value,
  options,
  disabled,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  options: { value: T; label: string; description?: string }[];
  disabled?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className={labelClass}>{legend}</legend>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {options.map((opt) => (
          <label key={String(opt.value)} className="flex items-center gap-1.5">
            <input
              type="radio"
              name={name}
              checked={value === opt.value}
              disabled={disabled}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
            {opt.description && (
              <span className="text-xs text-gray-500">{opt.description}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
