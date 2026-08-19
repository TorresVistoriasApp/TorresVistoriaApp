import { useState } from "react";
import { CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { usePlatformServices } from "@/modules/torres-vistoria/hooks/use-platform-services";
import { formatServicePrice, type PlatformService } from "@/modules/torres-vistoria/services/platform-service-service";
import { cn } from "@/shared/lib/utils";

interface ServiceSelectorModalProps {
  open: boolean;
  onSelect: (service: PlatformService) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ServiceSelectorModal({
  open,
  onSelect,
  onCancel,
  isLoading = false,
}: ServiceSelectorModalProps) {
  const { data: services, isLoading: loadingServices, error } = usePlatformServices();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedService = services?.find((s) => s.id === selectedId) ?? null;

  function handleConfirm() {
    if (!selectedService || isLoading) return;
    onSelect(selectedService);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !isLoading) onCancel();
      }}
    >
      <DialogContent
        className="w-full max-w-md sm:max-w-lg"
        onInteractOutside={(e) => {
          // Impede fechamento por clique fora quando está processando
          if (isLoading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Selecione o serviço</DialogTitle>
          <DialogDescription>
            Escolha o tipo de serviço que será realizado nesta vistoria.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-3">
          {loadingServices && (
            <div className="flex justify-center py-8">
              <LoadingSpinner label="Carregando serviços..." />
            </div>
          )}

          {error && !loadingServices && (
            <p className="py-4 text-center text-sm text-destructive">
              Não foi possível carregar os serviços. Verifique sua conexão.
            </p>
          )}

          {!loadingServices &&
            !error &&
            services?.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={selectedId === service.id}
                disabled={isLoading}
                onClick={() => setSelectedId(service.id)}
              />
            ))}
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedService || isLoading}
            className="order-1 sm:order-2"
          >
            {isLoading ? (
              <LoadingSpinner label="Criando vistoria..." />
            ) : (
              "Continuar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Subcomponente ────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: PlatformService;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}

function ServiceCard({ service, selected, disabled, onClick }: ServiceCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-xl border-2 p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Textos */}
        <div className="min-w-0 flex-1">
          <p className={cn(
            "text-base font-semibold leading-tight",
            selected ? "text-primary" : "text-foreground",
          )}>
            {service.name}
          </p>
          {service.description && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {service.description}
            </p>
          )}
        </div>

        {/* Preço + check */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={cn(
            "text-lg font-bold tabular-nums",
            selected ? "text-primary" : "text-foreground",
          )}>
            {formatServicePrice(service.base_price, service.currency)}
          </span>
          <div className={cn(
            "h-5 w-5 transition-opacity",
            selected ? "opacity-100" : "opacity-0",
          )}>
            <CheckCircle className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </button>
  );
}
