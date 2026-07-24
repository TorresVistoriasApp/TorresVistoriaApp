import { CAR_BRANDS } from "@/lib/vehicle-brands";
import { PUBLIC_IMAGES } from "@/lib/public-images";

/** Slug do arquivo em `public/images/vehicle-brands/{slug}.webp`. */
const BRAND_LOGO_SLUGS: Record<string, string> = {
  Fiat: "fiat",
  Volkswagen: "volkswagen",
  Chevrolet: "chevrolet",
  Toyota: "toyota",
  Hyundai: "hyundai",
  Renault: "renault",
  Jeep: "jeep",
  Honda: "honda",
  Nissan: "nissan",
  Ford: "ford",
  Mitsubishi: "mitsubishi",
  BMW: "bmw",
  "Mercedes-Benz": "mercedes-benz",
  Audi: "audi",
  Peugeot: "peugeot",
  "Citroën": "citroen",
  Chery: "chery",
  BYD: "byd",
  GWM: "gwm",
  Kia: "kia",
  RAM: "ram",
  "Land Rover": "land-rover",
  Volvo: "volvo",
  Suzuki: "suzuki",
  JAC: "jac",
  Haval: "haval",
  Mini: "mini",
  Porsche: "porsche",
  Subaru: "subaru",
  Iveco: "iveco",
};

/** Normaliza texto de marca para comparação (acentos, hífen, espaços). */
function normalizeBrandKey(brand: string): string {
  return brand
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const slugByNormalizedKey = Object.fromEntries(
  Object.entries(BRAND_LOGO_SLUGS).map(([brand, slug]) => [normalizeBrandKey(brand), slug]),
);

function resolveBrandLogoUrl(slug: string): string {
  return PUBLIC_IMAGES.vehicleBrands(slug);
}

/** Retorna a URL do logo da marca, ou null se não houver arquivo. */
export function getBrandLogoPath(brand: string | null | undefined): string | null {
  if (!brand?.trim()) return null;

  const trimmed = brand.trim();
  const directSlug = BRAND_LOGO_SLUGS[trimmed];
  if (directSlug) return resolveBrandLogoUrl(directSlug);

  const normalizedSlug = slugByNormalizedKey[normalizeBrandKey(trimmed)];
  if (normalizedSlug) return resolveBrandLogoUrl(normalizedSlug);

  return null;
}

export const BRANDS_WITH_LOGOS = CAR_BRANDS.filter((brand) => getBrandLogoPath(brand) !== null);
