import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { PHOTO_CATEGORIES } from "@/lib/constants";
import { PhotoCategories } from "@/components/photos/photo-categories";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function PhotoUpload({
  onUpload,
  uploading,
}: {
  onUpload: (file: File, category: string) => void;
  uploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<string>(PHOTO_CATEGORIES[0]);

  const handleFiles = (files: FileList | null) => {
    if (!files?.[0]) return;
    onUpload(files[0], category);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div>
        <Label>Categoria</Label>
        <div className="mt-2">
          <PhotoCategories selected={category} onSelect={setCategory} />
        </div>
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
          className="touch-target"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Galeria
        </Button>
        <Button
          type="button"
          className="touch-target"
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
