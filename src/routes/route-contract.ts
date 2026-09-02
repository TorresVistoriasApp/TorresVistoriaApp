import type { RouteObject } from "react-router-dom";
import type { Permission } from "@/core/rbac/permissions";

export interface ModuleRoutes {
  /** Landing e páginas de marketing: layout próprio, sem shell do tenant. */
  marketing?: RouteObject[];
  /** Área pública: sem sessão, dentro do `PublicLayout`. */
  public?: RouteObject[];
  /** Área de autenticação: sem sessão, dentro do `AuthLayout`. */
  auth?: RouteObject[];
  /** Área do cliente: exige sessão de tenant, dentro do `ClientLayout`. */
  client?: RouteObject[];
  /** Área administrativa da plataforma, dentro do `AdminLayout`. */
  platform?: RouteObject[];
  /**
   * Rotas autenticadas que precisam escapar do `ClientLayout` — por exemplo a
   * troca de senha obrigatória, que roda antes do shell da aplicação.
   */
  standalone?: RouteObject[];
  /** Área do consumidor final (B2C): autenticado, sem tenant, layout próprio. */
  consumer?: RouteObject[];
}

export interface RouteAccess {
  /** Exige esta permissão específica. */
  permission?: Permission;
  /** Exige ao menos uma das permissões. */
  anyOf?: Permission[];
}
