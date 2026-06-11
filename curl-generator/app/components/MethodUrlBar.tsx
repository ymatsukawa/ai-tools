import { HTTP_METHODS, type HttpMethod } from "../utils/curl";
import { fieldClass, monoFieldClass } from "./ui";

interface Props {
  method: HttpMethod;
  url: string;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
}

export function MethodUrlBar({ method, url, onMethodChange, onUrlChange }: Props) {
  return (
    <div className="flex gap-2">
      <select
        value={method}
        onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
        aria-label="HTTP method"
        className={`${fieldClass} font-semibold`}
      >
        {HTTP_METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://api.example.com/users"
        aria-label="URL"
        className={`${monoFieldClass} flex-1`}
      />
    </div>
  );
}
