import type { TableSchema } from "./er-types";

// Mermaid erDiagram identifiers cannot contain arbitrary characters, so
// names are sanitized. This is display-only — originals stay in TableSchema.

function entityName(name: string): string {
  const safe = name.replace(/[^A-Za-z0-9_-]/g, "_");
  return /^[A-Za-z]/.test(safe) ? safe : `T_${safe}`;
}

function attrName(name: string): string {
  const safe = name.replace(/[^A-Za-z0-9_-]/g, "_");
  // Emitted as the first attribute token, which mermaid parses as a "type" —
  // that grammar requires a leading alphabetic character.
  return /^[A-Za-z]/.test(safe) ? safe : `c_${safe}`;
}

function attrType(dataType: string): string {
  const safe = dataType
    .trim()
    .replace(/,\s*/g, "-") // decimal(10,2) → decimal(10-2)
    .replace(/\s+/g, "_") // timestamp with time zone → timestamp_with_time_zone
    .replace(/[^A-Za-z0-9_\-()[\]]/g, "");
  if (safe === "") return "any";
  return /^[A-Za-z]/.test(safe) ? safe : `t_${safe}`;
}

function relationLabel(columns: string[]): string {
  return columns.join(", ").replace(/"/g, "'");
}

/** A FK whose columns exactly match a unique index (or the PK) implies 1:1. */
function isFkUnique(table: TableSchema, fkColumns: string[]): boolean {
  const fkSet = new Set(fkColumns);
  const matches = (cols: string[]) =>
    cols.length === fkSet.size && cols.every((c) => fkSet.has(c));
  if (matches(table.columns.filter((c) => c.isPrimary).map((c) => c.name))) {
    return true;
  }
  return table.indexes.some((ix) => ix.unique && matches(ix.columns));
}

export function buildErDiagram(schemas: TableSchema[]): string {
  const lines = ["erDiagram"];
  for (const table of schemas) lines.push(...entityLines(table));
  for (const table of schemas) lines.push(...relationshipLines(table));
  return lines.join("\n");
}

function entityLines(table: TableSchema): string[] {
  const fkColumns = new Set(table.foreignKeys.flatMap((fk) => fk.columns));
  const lines = [`  ${entityName(table.name)} {`];
  for (const col of table.columns) {
    // Mermaid renders attribute tokens in fixed order (type, name, keys,
    // comment). To display "column | type | extras" instead, the column
    // name is emitted in the type slot, the data type in the name slot,
    // and keys + nullability are merged into the comment.
    const extras = [
      col.isPrimary && "PK",
      fkColumns.has(col.name) && "FK",
      !col.isPrimary && col.isUnique && "UK",
      col.nullable && "nullable",
    ]
      .filter(Boolean)
      .join(", ");
    lines.push(
      `    ${attrName(col.name)} ${attrType(col.dataType)}${extras ? ` "${extras}"` : ""}`
    );
  }
  lines.push("  }");
  return lines;
}

function relationshipLines(table: TableSchema): string[] {
  return table.foreignKeys.map((fk) => {
    // A referenced table outside the scan still appears, as a bare entity
    const childCardinality = isFkUnique(table, fk.columns) ? "||" : "o{";
    return `  ${entityName(fk.refTable)} ||--${childCardinality} ${entityName(table.name)} : "${relationLabel(fk.columns)}"`;
  });
}
