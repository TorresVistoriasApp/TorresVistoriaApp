import { useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { PHOTO_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const categoryLabels: Record<string, string> = {
  FRENTE_45: "Frente 45°",
  TRASEIRA_45: "Traseira 45°",
  LATERAL_DIREITA: "Lateral direita",
  LATERAL_ESQUERDA: "Lateral esquerda",
  MOTOR: "Motor",
  CHASSI: "Chassi",
  PAINEL: "Painel",
  HODOMETRO: "Hodômetro",
  ESTRUTURA: "Estrutura",
  VIDROS: "Vidros",
  ETIQUETAS: "Etiquetas",
  DANOS: "Danos",
  EXTRAS: "Extras",
};

export function PhotoUpload({
  onUpload,
  uploading,
}: {
  onUpload: (file: File, category: string) => void;
  uploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<string>(PHOTO_CATEGORIES[0]);

  const handleFiles = (files: FileList | null) => {
    if (!files?.[0]) return;
    onUpload(files[0], categoryRef.current);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div>
        <Label htmlFor="photo-category">Categoria</Label>
        <select
          id="photo-category"
          className="mt-1 flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
          defaultValue={PHOTO_CATEGORIES[0]}
          onChange={(e) => {
            categoryRef.current = e.target.value;
          }}
        >
          {PHOTO_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat] ?? cat}
            </option>
          ))}
        </select>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Galeria
        </Button>
        <Button
          type="button"
          disabled={uploading}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.setAttribute("capture", "environment");
              inputRef.current.click();
            }
          }}
        >
          <Camera className="h-4 w-4" />
          {uploading ? "Enviando..." : "Câmera"}
        </Button>
      </div>
    </div>
  );
}
