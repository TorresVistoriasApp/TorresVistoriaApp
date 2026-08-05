/**
 * Design system do Ecossistema Torres.
 *
 * Tokens são a fonte de verdade tipada. Primitives vivem em `shared/ui` e são
 * reexportados aqui como contrato público recomendado para módulos novos —
 * sem mover arquivos nesta rodada (risco alto de churn).
 */

export {
  colorTokens,
  spacingTokens,
  radiusTokens,
  typographyTokens,
  type ColorToken,
  type SpacingToken,
  type RadiusToken,
  type TypographyToken,
} from "@/shared/design-system/tokens";

export { Button } from "@/shared/ui/button";
export { Input } from "@/shared/ui/input";
export { Label } from "@/shared/ui/label";
export { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
