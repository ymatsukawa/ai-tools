import type { CurlFormHandle } from "../hooks/useCurlForm";
import type { AuthMode, CurlOptions } from "../utils/curl";
import { monoFieldClass } from "./ui";

const FLAG_OPTIONS: { key: keyof CurlOptions; label: string }[] = [
  { key: "followRedirects", label: "Follow redirects (-L)" },
  { key: "insecure", label: "Ignore certificate errors (-k)" },
  { key: "verbose", label: "Verbose (-v)" },
  { key: "silent", label: "Hide progress (-s)" },
  { key: "includeResponseHeaders", label: "Include response headers (-i)" },
];

const AUTH_MODES: { id: AuthMode; label: string }[] = [
  { id: "none", label: "None" },
  { id: "basic", label: "Basic auth (-u)" },
  { id: "bearer", label: "Bearer token" },
];

export function OptionsTab({ form }: { form: CurlFormHandle }) {
  const { config, updateOption } = form;
  const { options } = config;

  return (
    <div className="flex flex-col gap-5">
      <FlagsFieldset options={options} updateOption={updateOption} />
      <LimitsFields options={options} updateOption={updateOption} />
      <AuthFieldset options={options} updateOption={updateOption} />
    </div>
  );
}

interface SectionProps {
  options: CurlOptions;
  updateOption: <K extends keyof CurlOptions>(
    key: K,
    value: CurlOptions[K],
  ) => void;
}

function FlagsFieldset({ options, updateOption }: SectionProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-semibold mb-1">Flags</legend>
      {FLAG_OPTIONS.map((flag) => (
        <label key={flag.key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={options[flag.key] as boolean}
            onChange={(e) => updateOption(flag.key, e.target.checked)}
          />
          {flag.label}
        </label>
      ))}
    </fieldset>
  );
}

function LimitsFields({ options, updateOption }: SectionProps) {
  return (
    <div className="flex flex-wrap gap-6">
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Timeout seconds (--max-time)</span>
        <input
          type="number"
          min={1}
          value={options.timeoutSeconds}
          onChange={(e) => updateOption("timeoutSeconds", e.target.value)}
          placeholder="none"
          className={`${monoFieldClass} w-40`}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Output file (-o)</span>
        <input
          type="text"
          value={options.outputFile}
          onChange={(e) => updateOption("outputFile", e.target.value)}
          placeholder="response.json"
          className={`${monoFieldClass} w-56`}
        />
      </label>
    </div>
  );
}

function AuthFieldset({ options, updateOption }: SectionProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-semibold mb-1">Authentication</legend>
      <div className="flex gap-4" role="radiogroup" aria-label="Auth method">
        {AUTH_MODES.map((mode) => (
          <label key={mode.id} className="flex items-center gap-1.5">
            <input
              type="radio"
              name="authMode"
              checked={options.authMode === mode.id}
              onChange={() => updateOption("authMode", mode.id)}
            />
            {mode.label}
          </label>
        ))}
      </div>
      {options.authMode === "basic" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={options.basicUser}
            onChange={(e) => updateOption("basicUser", e.target.value)}
            placeholder="user"
            aria-label="Basic auth user"
            className={`${monoFieldClass} w-48`}
          />
          <input
            type="password"
            value={options.basicPassword}
            onChange={(e) => updateOption("basicPassword", e.target.value)}
            placeholder="password"
            aria-label="Basic auth password"
            className={`${monoFieldClass} w-48`}
          />
        </div>
      )}
      {options.authMode === "bearer" && (
        <input
          type="text"
          value={options.bearerToken}
          onChange={(e) => updateOption("bearerToken", e.target.value)}
          placeholder="token"
          aria-label="Bearer token"
          className={`${monoFieldClass} w-full max-w-md`}
        />
      )}
    </fieldset>
  );
}
