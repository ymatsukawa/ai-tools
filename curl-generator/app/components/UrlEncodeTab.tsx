import { useState } from "react";
import { CopyButton, monoFieldClass, readonlyFieldClass } from "./ui";

export function UrlEncodeTab() {
  const [raw, setRaw] = useState("");
  const encoded = encodeURIComponent(raw);

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Value</span>
        <input
          type="text"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="String containing ?&= or non-ASCII characters"
          className={monoFieldClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">URL encoded</span>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={encoded}
            aria-label="URL encoded result"
            className={`${readonlyFieldClass} flex-1`}
          />
          <CopyButton text={encoded} disabled={raw === ""} />
        </div>
      </label>
    </div>
  );
}
