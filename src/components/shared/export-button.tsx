import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  return (
    <div className={cn(className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            size={size}
            className={buttonClassName}
            disabled={disabled}
            aria-haspopup="menu"
          >
            <Download className="h-4 w-4" />
            Exportar
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[var(--radix-dropdown-menu-trigger-width)] w-44"
        >
          <DropdownMenuItem onClick={() => void onExportPdf()}>
            <FileText className="h-4 w-4 text-primary" />
            Exportar PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void onExportExcel()}>
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            Exportar Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
