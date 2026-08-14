import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { consumerAccountService } from "@/core/auth/consumer-account-service";
import { ConsumerAccountStatus } from "@/core/auth/types";
import type { ConsumerProfile } from "@/core/auth/types";
import { cacheKeys } from "@/core/cache";
import { getErrorMessage } from "@/core/errors/app-error";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/ui/button";

const DELETION_GRACE_DAYS = 90;

function formatDeletionDate(isoDate: string | null): string {
  if (!isoDate) return "em breve";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(isoDate));
}

function daysUntilDeletion(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const diffMs = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

interface ConsumerAccountPrivacySectionProps {
  profile: ConsumerProfile;
  onAccountChanged?: () => void;
}

export function ConsumerAccountPrivacySection({
  profile,
  onAccountChanged,
}: ConsumerAccountPrivacySectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const isPendingDeletion = profile.account_status === ConsumerAccountStatus.PENDING_DELETION;
  const remainingDays = daysUntilDeletion(profile.deletion_scheduled_at);

  const invalidateProfile = () => {
    void queryClient.invalidateQueries({ queryKey: cacheKeys.consumer.profile(profile.id) });
  };

  const handleRequestDeletion = async () => {
    setIsDeleting(true);
    try {
      await consumerAccountService.requestDeletion();
      invalidateProfile();
      onAccountChanged?.();
      setConfirmDelete(false);
      toast({
        title: "Exclusão solicitada",
        description: `Sua conta ficará inativa por ${DELETION_GRACE_DAYS} dias. Você pode reativá-la em Minha conta antes dessa data.`,
      });
    } catch (cause) {
      toast({
        type: "error",
        title: "Não foi possível solicitar exclusão",
        description: getErrorMessage(cause),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactivate = async () => {
    setIsReactivating(true);
    try {
      await consumerAccountService.reactivate();
      invalidateProfile();
      onAccountChanged?.();
      toast({
        title: "Conta reativada",
        description: "Sua conta voltou ao normal. Bem-vindo de volta!",
      });
    } catch (cause) {
      toast({
        type: "error",
        title: "Não foi possível reativar",
        description: getErrorMessage(cause),
      });
    } finally {
      setIsReactivating(false);
    }
  };

  if (isPendingDeletion) {
    return (
      <div className="space-y-4 pt-4">
        <div className="flex gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Conta inativa — exclusão programada</p>
            <p className="leading-relaxed text-muted-foreground">
              Você solicitou a exclusão da sua conta. Ela permanece inativa por até{" "}
              {DELETION_GRACE_DAYS} dias e será removida permanentemente em{" "}
              <span className="font-medium text-foreground">
                {formatDeletionDate(profile.deletion_scheduled_at)}
              </span>
              {remainingDays !== null && (
                <>
                  {" "}
                  ({remainingDays} {remainingDays === 1 ? "dia restante" : "dias restantes"})
                </>
              )}
              .
            </p>
            <p className="text-muted-foreground">
              Para continuar usando a Torres Consulta, reative sua conta abaixo. Após o prazo, todos
              os dados serão excluídos conforme a LGPD.
            </p>
          </div>
        </div>

        <Button
          className="rounded-full"
          disabled={isReactivating}
          onClick={() => void handleReactivate()}
        >
          {isReactivating ? "Reativando..." : "Reativar minha conta"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Conforme a LGPD, você pode solicitar a exclusão da sua conta. A conta ficará inativa por{" "}
        {DELETION_GRACE_DAYS} dias — nesse período você pode entrar novamente e reativá-la em Minha
        conta. Após o prazo, os dados serão removidos permanentemente do nosso banco.
      </p>

      {!confirmDelete ? (
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-4 w-4" />
          Solicitar exclusão da conta
        </Button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Confirma a exclusão da conta <span className="font-medium">{profile.email}</span>? Ela
            ficará inativa por {DELETION_GRACE_DAYS} dias antes da remoção definitiva.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              disabled={isDeleting}
              onClick={() => void handleRequestDeletion()}
            >
              {isDeleting ? "Processando..." : "Sim, solicitar exclusão"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={isDeleting}
              onClick={() => setConfirmDelete(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
