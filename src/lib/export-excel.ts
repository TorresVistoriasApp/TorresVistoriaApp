import ExcelJS from "exceljs";
import { PUBLIC_IMAGES } from "@/lib/public-images";

type ExportColumn<T> = {
  header: string;
  key: keyof T;
  width?: number;
  numFmt?: string;
};

type ExportExcelOptions = {
  title?: string;
  subtitle?: string;
  sheetName?: string;
  logoUrl?: string;
};

async function imageUrlToPngBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export async function exportToExcel<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
  options: ExportExcelOptions = {},
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(options.sheetName ?? "Dados");
  const headerRowNumber = options.title || options.subtitle ? 5 : 1;
  const lastColumn = Math.max(columns.length, 1);

  workbook.creator = "Torres Vistoria";
  workbook.created = new Date();

  if (options.title || options.subtitle) {
    const logo = await imageUrlToPngBase64(options.logoUrl ?? PUBLIC_IMAGES.brand.trim);
    if (logo) {
      const logoId = workbook.addImage({ base64: logo, extension: "png" });
      sheet.addImage(logoId, {
        tl: { col: 0, row: 0 },
        ext: { width: 130, height: 58 },
      });
    }

    sheet.mergeCells(1, 1, 1, lastColumn);
    sheet.getCell(1, 1).value = options.title ?? "Exportação";
    sheet.getCell(1, 1).font = { bold: true, size: 16, color: { argb: "FF0F172A" } };
    sheet.getCell(1, 1).alignment = { vertical: "middle", horizontal: logo ? "right" : "left" };
    sheet.getRow(1).height = 34;

    sheet.mergeCells(2, 1, 2, lastColumn);
    sheet.getCell(2, 1).value = options.subtitle ?? "";
    sheet.getCell(2, 1).font = { size: 10, color: { argb: "FF64748B" } };
    sheet.getCell(2, 1).alignment = { horizontal: logo ? "right" : "left" };

    sheet.mergeCells(3, 1, 3, lastColumn);
    sheet.getCell(3, 1).value = `Gerado em ${new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date())}`;
    sheet.getCell(3, 1).font = { size: 9, color: { argb: "FF64748B" } };
    sheet.getCell(3, 1).alignment = { horizontal: logo ? "right" : "left" };
  }

  columns.forEach((column, index) => {
    const sheetColumn = sheet.getColumn(index + 1);
    sheetColumn.key = String(column.key);
    sheetColumn.width = column.width ?? 18;
    if (column.numFmt) {
      sheetColumn.numFmt = column.numFmt;
    }
    sheet.getCell(headerRowNumber, index + 1).value = column.header;
  });

  rows.forEach((row) => {
    sheet.addRow(row);
  });

  const headerRow = sheet.getRow(headerRowNumber);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEA580C" },
  };
  headerRow.alignment = { vertical: "middle" };
  headerRow.height = 22;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber < headerRowNumber) return;

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = { vertical: "middle" };
    });

    if (rowNumber > headerRowNumber && rowNumber % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF7ED" },
        };
      });
    }
  });

  sheet.autoFilter = {
    from: { row: headerRowNumber, column: 1 },
    to: { row: headerRowNumber, column: lastColumn },
  };
  sheet.views = [{ state: "frozen", ySplit: headerRowNumber }];

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
