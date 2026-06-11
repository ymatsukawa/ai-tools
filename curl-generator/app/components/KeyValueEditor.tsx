import type { KeyValue } from "../utils/curl";
import { AddRowButton, monoFieldClass, RemoveRowButton } from "./ui";

interface Props {
  rows: KeyValue[];
  keyPlaceholder: string;
  valuePlaceholder: string;
  onAdd: () => void;
  onUpdate: (id: string, part: "key" | "value", value: string) => void;
  onRemove: (id: string) => void;
}

export function KeyValueEditor({
  rows,
  keyPlaceholder,
  valuePlaceholder,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.id} className="flex gap-2">
          <input
            type="text"
            value={row.key}
            onChange={(e) => onUpdate(row.id, "key", e.target.value)}
            placeholder={keyPlaceholder}
            className={`${monoFieldClass} w-1/3`}
          />
          <input
            type="text"
            value={row.value}
            onChange={(e) => onUpdate(row.id, "value", e.target.value)}
            placeholder={valuePlaceholder}
            className={`${monoFieldClass} flex-1`}
          />
          <RemoveRowButton onClick={() => onRemove(row.id)} />
        </div>
      ))}
      <AddRowButton onClick={onAdd} />
    </div>
  );
}
