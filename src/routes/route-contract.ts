import type { RouteObject } from "react-router-dom";
import type { Permission } from "@/core/rbac/permissions";

/**
 * Contrato que todo módulo publica para se registrar no roteador.
 *
 * O módulo declara **onde** suas telas vivem em termos de área de acesso, mas
 * nunca instancia layouts nem guardas: essa composição é responsabilidade
 * exclusiva de `@/routes/router`. Assim um módulo pode ser adicionado ou
 * removido sem que nenhum layout precise ser alterado.
 */
export interface ModuleRoutes {
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
}

/**
 * Metadados de autorização de uma rota. Mantidos junto da definição da rota
 * para que a decisão de acesso fique no manifesto do módulo, e não espalhada
 * dentro dos componentes de tela.
 */
export interface RouteAccess {
  /** Exige esta permissão específica. */
  permission?: Permission;
  /** Exige ao menos uma das permissões. */
  anyOf?: Permission[];
}
