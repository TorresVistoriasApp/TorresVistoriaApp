import type {
  IllustrationReference,
  TechnicalIllustrationDefinition,
  TechnicalIllustrationId,
} from "@/lib/photos/illustrations/types";
import { damageDetail } from "@/lib/photos/illustrations/views/damage-detail";
import { documentSheet } from "@/lib/photos/illustrations/views/document-sheet";
import { doorStructure } from "@/lib/photos/illustrations/views/door-structure";
import { engineCompartment } from "@/lib/photos/illustrations/views/engine-compartment";
import { identificationPlate } from "@/lib/photos/illustrations/views/identification-plate";
import { interiorCabin } from "@/lib/photos/illustrations/views/interior-cabin";
import { pillarStructure } from "@/lib/photos/illustrations/views/pillar-structure";
import { safetyEquipment } from "@/lib/photos/illustrations/views/safety-equipment";
import { trunkCompartment } from "@/lib/photos/illustrations/views/trunk-compartment";
import { vehicleFront } from "@/lib/photos/illustrations/views/vehicle-exterior-front";
import { vehicleRear } from "@/lib/photos/illustrations/views/vehicle-exterior-rear";
import { vehicleSideLeft } from "@/lib/photos/illustrations/views/vehicle-exterior-side";
import { vehicleTop } from "@/lib/photos/illustrations/views/vehicle-exterior-top";
import { wheelAssembly } from "@/lib/photos/illustrations/views/wheel-assembly";
import { windshieldGlass } from "@/lib/photos/illustrations/views/windshield-glass";

/** Catálogo mestre de ilustrações técnicas vetoriais. */
export const ILLUSTRATION_CATALOG: Record<TechnicalIllustrationId, TechnicalIllustrationDefinition> = {
  "vehicle-side-left": vehicleSideLeft,
  "vehicle-side-right": { ...vehicleSideLeft, id: "vehicle-side-right" },
  "vehicle-front": vehicleFront,
  "vehicle-rear": vehicleRear,
  "vehicle-top": vehicleTop,
  "engine-compartment": engineCompartment,
  "trunk-compartment": trunkCompartment,
  "interior-cabin": interiorCabin,
  "wheel-assembly": wheelAssembly,
  "document-sheet": documentSheet,
  "door-structure": doorStructure,
  "pillar-structure": pillarStructure,
  "identification-plate": identificationPlate,
  "windshield-glass": windshieldGlass,
  "safety-equipment": safetyEquipment,
  "damage-detail": damageDetail,
};

export function getIllustration(id: TechnicalIllustrationId): TechnicalIllustrationDefinition {
  return ILLUSTRATION_CATALOG[id];
}

export function getIllustrationPart(
  illustrationId: TechnicalIllustrationId,
  partId: string,
) {
  const illustration = getIllustration(illustrationId);
  return illustration.parts.find((part) => part.id === partId);
}

export function resolveIllustrationReference(
  categoryKey: string,
  map: Record<string, IllustrationReference>,
): IllustrationReference {
  if (map[categoryKey]) return map[categoryKey];

  if (categoryKey.startsWith("PINT_")) {
    return resolvePaintIllustration(categoryKey);
  }

  return { illustrationId: "damage-detail", highlightPartId: "component-area" };
}

function resolvePaintIllustration(categoryKey: string): IllustrationReference {
  const paintMap: Record<string, IllustrationReference> = {
    PINT_CAPO: { illustrationId: "vehicle-side-left", highlightPartId: "hood" },
    PINT_TETO: { illustrationId: "vehicle-top", highlightPartId: "roof" },
    PINT_TAMPA_PORTA_MALAS: { illustrationId: "vehicle-side-left", highlightPartId: "trunk-lid" },
    PINT_PARALAMA_DIANT_ESQ: { illustrationId: "vehicle-side-left", highlightPartId: "front-fender" },
    PINT_PORTA_DIANT_ESQ: { illustrationId: "vehicle-side-left", highlightPartId: "front-door" },
    PINT_PORTA_TRASEIRA_ESQ: { illustrationId: "vehicle-side-left", highlightPartId: "rear-door" },
    PINT_LATERAL_TRASEIRA_ESQ: { illustrationId: "vehicle-side-left", highlightPartId: "rear-quarter" },
    PINT_LATERAL_TRASEIRA_DIR: { illustrationId: "vehicle-side-right", highlightPartId: "rear-quarter" },
    PINT_PORTA_TRASEIRA_DIR: { illustrationId: "vehicle-side-right", highlightPartId: "rear-door" },
    PINT_PORTA_DIANT_DIR: { illustrationId: "vehicle-side-right", highlightPartId: "front-door" },
    PINT_PARALAMA_DIANT_DIR: { illustrationId: "vehicle-side-right", highlightPartId: "front-fender" },
    PINT_PARACHOQUE_DIANTEIRO: { illustrationId: "vehicle-front", highlightPartId: "front-bumper" },
    PINT_PARACHOQUE_TRASEIRO: { illustrationId: "vehicle-rear", highlightPartId: "rear-bumper" },
    PINT_MEDIDOR_ESPESSURA: { illustrationId: "damage-detail", highlightPartId: "paint-test" },
    PINT_CANETA_TESTE: { illustrationId: "damage-detail", highlightPartId: "paint-test" },
  };

  return paintMap[categoryKey] ?? { illustrationId: "damage-detail", highlightPartId: "component-area" };
}

/** Mapeamento categoria → ilustração + peça destacada. */
export const CATEGORY_ILLUSTRATION_MAP: Record<string, IllustrationReference> = {
  // Documentação
  DOC_VEICULO: { illustrationId: "document-sheet", highlightPartId: "full-document" },
  DOC_CRLV: { illustrationId: "document-sheet", highlightPartId: "crlv" },
  DOC_CRV: { illustrationId: "document-sheet", highlightPartId: "crv" },
  DOC_ATPV_E: { illustrationId: "document-sheet", highlightPartId: "atpv" },
  DOC_OUTROS: { illustrationId: "document-sheet", highlightPartId: "full-document" },

  // Identificação externa
  EXT_FRENTE_45_ESQ: { illustrationId: "vehicle-front", highlightPartId: "front-left-45" },
  EXT_FRENTE_45_DIR: { illustrationId: "vehicle-front", highlightPartId: "front-right-45" },
  EXT_FRENTE_COMPLETA: { illustrationId: "vehicle-front", highlightPartId: "full-front" },
  EXT_LATERAL_ESQ: { illustrationId: "vehicle-side-left", highlightPartId: "full-side" },
  EXT_LATERAL_DIR: { illustrationId: "vehicle-side-right", highlightPartId: "full-side" },
  EXT_TRASEIRA_45_ESQ: { illustrationId: "vehicle-rear", highlightPartId: "rear-left-45" },
  EXT_TRASEIRA_45_DIR: { illustrationId: "vehicle-rear", highlightPartId: "rear-right-45" },
  EXT_TRASEIRA_COMPLETA: { illustrationId: "vehicle-rear", highlightPartId: "full-rear" },
  EXT_PLACA_DIANTEIRA: { illustrationId: "vehicle-front", highlightPartId: "front-plate" },
  EXT_PLACA_TRASEIRA: { illustrationId: "vehicle-rear", highlightPartId: "rear-plate" },
  EXT_LACRE_PLACA: { illustrationId: "vehicle-side-left", highlightPartId: "plate-seal" },
  EXT_CAPO: { illustrationId: "vehicle-side-left", highlightPartId: "hood" },
  EXT_TETO: { illustrationId: "vehicle-top", highlightPartId: "roof" },
  EXT_PARACHOQUE_DIANTEIRO: { illustrationId: "vehicle-front", highlightPartId: "front-bumper" },
  EXT_PARACHOQUE_TRASEIRO: { illustrationId: "vehicle-rear", highlightPartId: "rear-bumper" },
  EXT_TAMPA_PORTA_MALAS: { illustrationId: "vehicle-side-left", highlightPartId: "trunk-lid" },

  // Compartimento motor
  MOT_COMPARTIMENTO: { illustrationId: "engine-compartment", highlightPartId: "full-compartment" },
  MOT_NUMERO_MOTOR: { illustrationId: "engine-compartment", highlightPartId: "engine-number" },
  MOT_ETIQUETA: { illustrationId: "engine-compartment", highlightPartId: "compartment-label" },
  MOT_PAINEL_CORTA_FOGO: { illustrationId: "engine-compartment", highlightPartId: "firewall" },
  MOT_PAINEL_FRONTAL: { illustrationId: "engine-compartment", highlightPartId: "front-panel" },
  MOT_LONGARINA_DIANT_ESQ: { illustrationId: "engine-compartment", highlightPartId: "longeron-left" },
  MOT_LONGARINA_DIANT_DIR: { illustrationId: "engine-compartment", highlightPartId: "longeron-right" },
  MOT_TORRE_AMORT_ESQ: { illustrationId: "engine-compartment", highlightPartId: "strut-tower-left" },
  MOT_TORRE_AMORT_DIR: { illustrationId: "engine-compartment", highlightPartId: "strut-tower-right" },

  // Estrutura traseira
  TRS_PORTA_MALAS_ABERTO: { illustrationId: "trunk-compartment", highlightPartId: "trunk-open" },
  TRS_PAINEL_SUPERIOR: { illustrationId: "trunk-compartment", highlightPartId: "upper-panel" },
  TRS_PAINEL_INFERIOR: { illustrationId: "trunk-compartment", highlightPartId: "lower-panel" },
  TRS_LONGARINA_TRASEIRA_ESQ: { illustrationId: "trunk-compartment", highlightPartId: "longeron-left" },
  TRS_LONGARINA_TRASEIRA_DIR: { illustrationId: "trunk-compartment", highlightPartId: "longeron-right" },
  TRS_PAINEL_ASSOALHO: { illustrationId: "trunk-compartment", highlightPartId: "floor-panel" },
  TRS_CAIXA_ESTEPE: { illustrationId: "trunk-compartment", highlightPartId: "spare-well" },
  TRS_ASSOALHO_PORTA_MALAS: { illustrationId: "trunk-compartment", highlightPartId: "trunk-floor" },

  // Estrutura lateral
  LAT_CAIXA_AR_ESQ: { illustrationId: "door-structure", highlightPartId: "rocker-left" },
  LAT_CAIXA_AR_DIR: { illustrationId: "door-structure", highlightPartId: "rocker-right" },
  LAT_QUADRO_PORTA_DIANT_ESQ: { illustrationId: "door-structure", highlightPartId: "front-door-frame-left" },
  LAT_COLUNA_DIANT_ESQ: { illustrationId: "pillar-structure", highlightPartId: "pillar-a-left" },
  LAT_COLUNA_CENTRAL_ESQ: { illustrationId: "pillar-structure", highlightPartId: "pillar-b-left" },
  LAT_QUADRO_PORTA_TRASEIRA_ESQ: { illustrationId: "door-structure", highlightPartId: "rear-door-frame-left" },
  LAT_COLUNA_TRASEIRA_ESQ: { illustrationId: "pillar-structure", highlightPartId: "pillar-c-left" },
  LAT_QUADRO_PORTA_DIANT_DIR: { illustrationId: "door-structure", highlightPartId: "front-door-frame-right" },
  LAT_COLUNA_DIANT_DIR: { illustrationId: "pillar-structure", highlightPartId: "pillar-a-right" },
  LAT_COLUNA_CENTRAL_DIR: { illustrationId: "pillar-structure", highlightPartId: "pillar-b-right" },
  LAT_QUADRO_PORTA_TRASEIRA_DIR: { illustrationId: "door-structure", highlightPartId: "rear-door-frame-right" },
  LAT_COLUNA_TRASEIRA_DIR: { illustrationId: "pillar-structure", highlightPartId: "pillar-c-right" },

  // Identificação veículo
  IDV_NUMERO_CHASSI: { illustrationId: "identification-plate", highlightPartId: "chassis-vin" },
  IDV_NUMERO_MOTOR: { illustrationId: "identification-plate", highlightPartId: "engine-vin" },
  IDV_ETIQUETA_COLUNA_DIR: { illustrationId: "identification-plate", highlightPartId: "pillar-label" },
  IDV_ETIQUETA_MOTOR: { illustrationId: "identification-plate", highlightPartId: "compartment-label" },
  IDV_GRAVACAO_VIDRO_DIANT: { illustrationId: "windshield-glass", highlightPartId: "glass-engraving" },
  IDV_GRAVACAO_VIDRO_TRASE: { illustrationId: "windshield-glass", highlightPartId: "rear-glass" },
  IDV_GRAVACAO_VIDRO_LATERAL: { illustrationId: "windshield-glass", highlightPartId: "side-glass" },

  // Interior
  INT_PAINEL_INSTRUMENTOS: { illustrationId: "interior-cabin", highlightPartId: "instrument-panel" },
  INT_PAINEL_BANCO_TRASEIRO: { illustrationId: "interior-cabin", highlightPartId: "rear-panel-view" },
  INT_HODOMETRO: { illustrationId: "interior-cabin", highlightPartId: "odometer" },
  INT_VOLANTE: { illustrationId: "interior-cabin", highlightPartId: "steering-wheel" },
  INT_CONSOLE_CENTRAL: { illustrationId: "interior-cabin", highlightPartId: "center-console" },
  INT_BANCOS_DIANTEIROS: { illustrationId: "interior-cabin", highlightPartId: "front-seats" },
  INT_BANCOS_TRASEIROS: { illustrationId: "interior-cabin", highlightPartId: "rear-seats" },
  INT_PORTAS_INTERNAS: { illustrationId: "interior-cabin", highlightPartId: "door-trim" },
  INT_REVESTIMENTOS: { illustrationId: "interior-cabin", highlightPartId: "trim-carpet" },

  // Segurança
  SEG_CINTO_DATA: { illustrationId: "safety-equipment", highlightPartId: "seatbelt-label" },
  SEG_AIRBAGS: { illustrationId: "safety-equipment", highlightPartId: "airbag" },
  SEG_EXTINTOR: { illustrationId: "safety-equipment", highlightPartId: "extinguisher" },
  SEG_MACACO: { illustrationId: "safety-equipment", highlightPartId: "jack" },
  SEG_TRIANGULO: { illustrationId: "safety-equipment", highlightPartId: "triangle" },
  SEG_CHAVE_RODA: { illustrationId: "safety-equipment", highlightPartId: "wheel-wrench" },
  SEG_ESTEPE: { illustrationId: "safety-equipment", highlightPartId: "spare-tire" },

  // Rodas e pneus
  ROD_DIANT_ESQ: { illustrationId: "vehicle-side-left", highlightPartId: "front-wheel" },
  ROD_DIANT_DIR: { illustrationId: "vehicle-side-right", highlightPartId: "front-wheel" },
  ROD_TRASEIRA_ESQ: { illustrationId: "vehicle-side-left", highlightPartId: "rear-wheel" },
  ROD_TRASEIRA_DIR: { illustrationId: "vehicle-side-right", highlightPartId: "rear-wheel" },
  ROD_ESTADO_PNEUS: { illustrationId: "wheel-assembly", highlightPartId: "tire-condition" },
  ROD_SULCO_PNEUS: { illustrationId: "wheel-assembly", highlightPartId: "tread" },

  // Avarias e complementares
  AVARIA: { illustrationId: "damage-detail", highlightPartId: "damage-area" },
  COMPLEMENTAR: { illustrationId: "damage-detail", highlightPartId: "component-area" },
};

export function getCategoryIllustration(categoryKey: string): IllustrationReference {
  return resolveIllustrationReference(categoryKey, CATEGORY_ILLUSTRATION_MAP);
}
