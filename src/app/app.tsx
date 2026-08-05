import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/router";

/**
 * Raiz da aplicação.
 *
 * Os providers ficam dentro do `RootLayout` do roteador, e não aqui, para que
 * as telas de erro do React Router também tenham acesso ao contexto.
 */
export function App() {
  return <RouterProvider router={router} />;
}
