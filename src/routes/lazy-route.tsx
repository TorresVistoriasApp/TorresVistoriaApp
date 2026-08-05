import { lazy, Suspense, type ComponentType, type ReactElement } from "react";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { RequireAnyPermission, RequirePermission } from "@/core/rbac/components/require-permission";
import { reloadOnceOnChunkLoadError } from "@/shared/lib/chunk-load-recovery";
import type { RouteAccess } from "@/routes/route-contract";

/**
 * Carrega uma página sob demanda a partir de um export nomeado.
 *
 * Recebe o nome do export em vez de assumir `default`, o que mantém as páginas
 * com nomes descritivos e faz o manifesto de rotas documentar a si mesmo.
 */
export function lazyRoute<Name extends string>(
  loader: () => Promise<Record<Name, ComponentType>>,
  exportName: Name,
  access?: RouteAccess,
): ReactElement {
  const Lazy = lazy(async () => {
    try {
      const module = await loader();
      return { default: module[exportName] as ComponentType };
    } catch (error) {
      // Deploy novo invalidou o chunk: recarrega uma vez em vez de quebrar a tela.
      if (reloadOnceOnChunkLoadError(error)) {
        return new Promise<{ default: ComponentType }>(() => {});
      }
      throw error;
    }
  });

  const page = (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <Lazy />
    </Suspense>
  );

  if (access?.anyOf?.length) {
    return <RequireAnyPermission permissions={access.anyOf}>{page}</RequireAnyPermission>;
  }
  if (access?.permission) {
    return <RequirePermission permission={access.permission}>{page}</RequirePermission>;
  }
  return page;
}
