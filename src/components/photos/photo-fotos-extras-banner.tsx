import { Link } from "react-router-dom";
import { Info, Shield } from "lucide-react";
import { FOTOS_EXTRAS_BLINDAGEM_KEYS } from "@/lib/photos/fotos-extras";

interface PhotoFotosExtrasBannerProps {
  isArmored: boolean;
  inspectionEditHref?: string;
}

export function PhotoFotosExtrasBanner({
  isArmored,
  inspectionEditHref,
}: PhotoFotosExtrasBannerProps) {
  if (isArmored) {
    return (
      <div className="flex gap-3 rounded-lg border border-violet-200/80 bg-violet-50/60 px-3 py-2.5 text-xs leading-relaxed text-violet-950">
        <Shield className="mt-0.5 size-4 shrink-0 text-violet-700" aria-hidden />
        <p>
          <span className="font-semibold">Veículo blindado.</span> A subseção{" "}
          <span className="font-medium">Blindagem</span> está disponível com{" "}
          {FOTOS_EXTRAS_BLINDAGEM_KEYS.length} fotografias opcionais (vidros, espessura, marca e
          documentação).
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        A subseção de <span className="font-medium text-foreground">Blindagem</span> aparece apenas
        para veículos blindados.
        {inspectionEditHref ? (
          <>
            {" "}
            Marque a opção em{" "}
            <Link
              to={inspectionEditHref}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              dados da vistoria
            </Link>
            .
          </>
        ) : (
          " Marque a opção \"Veículo blindado\" nos dados da vistoria."
        )}
      </p>
    </div>
  );
}
