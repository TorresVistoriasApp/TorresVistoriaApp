import ExcelJS from "exceljs";

type ExportColumn<T> = {
  header: string;
  key: keyof T;
  width?: number;
};

export async function exportToExcel<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Dados");

  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: String(c.key),
    width: c.width ?? 18,
  }));

  rows.forEach((row) => sheet.addRow(row));

  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
