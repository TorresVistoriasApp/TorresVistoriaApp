export function exportToCsv(
  rows: Record<string, string | number | null | undefined>[],
  columns: { header: string; key: string }[],
  filename: string,
): void {
  const header = columns.map((c) => c.header).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const value = row[c.key];
          const text = value == null ? "" : String(value);
          return text.includes(",") || text.includes('"') ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(","),
    )
    .join("\n");

  const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
