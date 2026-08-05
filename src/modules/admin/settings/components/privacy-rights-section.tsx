import { useState } from "react";
import { Download, Shield, Trash2 } from "lucide-react";
import { useAuth } from "@/core/auth/use-auth";
import { useExportMyData, useRequestAccountDeletion } from "@/core/compliance/use-lgpd";
import { useToast } from "@/shared/hooks/use-toast";
import { lgpdService } from "@/core/compliance/lgpd-service";
import { Button } from "@/shared/ui/button";
import {
  SETTINGS_FIELD_LABEL_CLASS,
  SettingsSection,
} from "@/shared/components/settings/settings-section";

export function PrivacyRightsSection({ className }: { className?: string }) {
  const { user } = useAuth();
  const exportData = useExportMyData();
  const deleteAccount = useRequestAccountDeletion();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExport = async () => {
    try {
      const data = await exportData.mutateAsync();
      lgpdService.downloadExport(data);
      toast("Arquivo com seus dados baixado");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao exportar dados");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync();
      toast("Conta anonimizada. Você será desconectado.");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao solicitar exclusão");
      setConfirmDelete(false);
    }
  };

  return (
    <SettingsSection
      icon={Shield}
      title="Privacidade (LGPD)"
      description="Exporte uma cópia dos seus dados ou solicite a anonimização da conta."
      className={className}
      fillHeight
    >
      <div className="space-y-5">
        <div>
          <p className={SETTINGS_FIELD_LABEL_CLASS}>Exportar meus dados</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Baixa um JSON com perfil, e-mail, vistorias e registros de auditoria.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 touch-target"
            disabled={!user?.id || exportData.isPending}
            onClick={() => void handleExport()}
          >
            <Download className="h-4 w-4" />
            {exportData.isPending ? "Preparando..." : "Baixar meus dados"}
          </Button>
        </div>

        <div className="border-t border-border/50 pt-5">
          <p className={SETTINGS_FIELD_LABEL_CLASS}>Excluir minha conta</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Anonimiza nome e avatar e marca o perfil como excluído. Esta ação não pode ser
            desfeita pelo aplicativo.
          </p>

          {!confirmDelete ? (
            <Button
              type="button"
              variant="outline"
              className="mt-3 touch-target text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={!user?.id || deleteAccount.isPending}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Solicitar exclusão
            </Button>
          ) : (
            <div className="mt-3 space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">
                Confirma a anonimização da conta <span className="font-medium">{user?.email}</span>?
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="destructive"
                  className="touch-target"
                  disabled={deleteAccount.isPending}
                  onClick={() => void handleDelete()}
                >
                  {deleteAccount.isPending ? "Processando..." : "Sim, excluir minha conta"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="touch-target"
                  disabled={deleteAccount.isPending}
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
