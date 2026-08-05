import type { PhotoCategoryDefinition } from "@/modules/torres-vistoria/domain/photos/types";
import { FOTOS_EXTRAS_BLINDAGEM_KEYS } from "@/modules/torres-vistoria/domain/photos/fotos-extras";

export type FotosExtrasUiGroupKey =
  | "ACESSORIOS"
  | "DOCUMENTACAO"
  | "EQUIPAMENTOS"
  | "BLINDAGEM";

export type FotosExtrasUiGroup = {
  key: FotosExtrasUiGroupKey;
  title: string;
  categoryKeys: readonly string[];
};

export const FOTOS_EXTRAS_UI_GROUPS: FotosExtrasUiGroup[] = [
  {
    key: "ACESSORIOS",
    title: "Acessórios",
    categoryKeys: [
      "EXTRA_CHAVE_PRINCIPAL",
      "EXTRA_CHAVE_RESERVA",
      "EXTRA_ESTEPE",
      "EXTRA_RODAS",
      "EXTRA_PNEUS_ESTADO",
    ],
  },
  {
    key: "DOCUMENTACAO",
    title: "Documentação",
    categoryKeys: ["EXTRA_MANUAL_PROPRIETARIO"],
  },
  {
    key: "EQUIPAMENTOS",
    title: "Equipamentos",
    categoryKeys: ["EXTRA_CHAVE_RODA", "EXTRA_MACACO", "EXTRA_TRIANGULO", "COMPLEMENTAR"],
  },
  {
    key: "BLINDAGEM",
    title: "Blindagem",
    categoryKeys: FOTOS_EXTRAS_BLINDAGEM_KEYS,
  },
];

export function groupFotosExtrasCategories(
  categories: PhotoCategoryDefinition[],
  isArmored: boolean,
): { group: FotosExtrasUiGroup; categories: PhotoCategoryDefinition[] }[] {
  const byKey = new Map(categories.map((category) => [category.key, category]));

  return FOTOS_EXTRAS_UI_GROUPS.filter(
    (group) => group.key !== "BLINDAGEM" || isArmored,
  ).map((group) => ({
    group,
    categories: group.categoryKeys
      .map((key) => byKey.get(key))
      .filter((category): category is PhotoCategoryDefinition => Boolean(category)),
  }));
}

export const SECTION_UI_GUIDANCE: Record<string, string> = {
  FOTOS_EXTRAS: "Adicione apenas os itens existentes no veículo.",
  QUADROS_PORTAS: "Fotografe os quadros das portas sem a borracha de vedação.",
  AVARIAS: "Toque em + para registrar cada avaria com foto e descrição.",
};
