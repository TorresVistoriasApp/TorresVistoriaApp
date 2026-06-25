import { useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  onExportPdf: () => void | Promise<void>;
  onExportExcel: () => void | Promise<void>;
  disabled?: boolean;
  size?: "sm" | "default";
  className?: string;
  buttonClassName?: string;
}

export function ExportButton({
  onExportPdf,
  onExportExcel,
  disabled = false,
  size = "sm",
  className,
  buttonClassName,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  const handleExportPdf = () => {
    setOpen(false);
    void onExportPdf();
  };

  const handleExportExcel = () => {
    setOpen(false);
    void onExportExcel();
  };

  return (
    <div
      className={cn("relative", className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <Button
        variant="outline"
        size={size}
        className={buttonClassName}
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Download className="h-4 w-4" />
        Exportar
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 right-0 z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card p-1 shadow-elevated sm:left-auto sm:right-0 sm:w-44"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-primary/5"
            onClick={handleExportPdf}
          >
            <FileText className="h-4 w-4 text-primary" />
            Exportar PDF
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-primary/5"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            Exportar Excel
          </button>
        </div>
      )}
    </div>
  );
}
