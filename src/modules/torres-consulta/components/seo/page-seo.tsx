import { useEffect } from "react";
import { CONSULTA_PUBLIC_ORIGIN } from "@/config/app";

export interface PageSeoProps {
  title: string;
  description: string;
  canonical?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: string;
  schema?: Record<string, unknown>;
}

const SITE_NAME = "Torres Consulta";

export function PageSeo({
  title,
  description,
  canonical,
  canonicalPath,
  ogImage = "/images/brand/official-trim.webp",
  ogType = "website",
  schema,
}: PageSeoProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    const resolvedCanonical =
      canonical ??
      (canonicalPath && typeof window !== "undefined"
        ? `${window.location.origin}${canonicalPath}`
        : undefined);

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", ogType, true);
    setMeta("og:image", ogImage, true);
    if (resolvedCanonical) setMeta("og:url", resolvedCanonical, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);

    if (resolvedCanonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = resolvedCanonical;
    }

    let schemaScript: HTMLScriptElement | null = null;
    if (schema) {
      schemaScript = document.createElement("script");
      schemaScript.type = "application/ld+json";
      schemaScript.textContent = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    }

    return () => {
      schemaScript?.remove();
    };
  }, [title, description, canonical, canonicalPath, ogImage, ogType, schema]);

  return null;
}

export const LANDING_SEO = {
  title: "Consulta Veicular Completa",
  description:
    "Vai comprar um carro usado? Consulte leilão, sinistro, recall e restrições pela placa ou chassi e receba o relatório na hora.",
  schema: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Torres Consulta",
    url: CONSULTA_PUBLIC_ORIGIN,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: "19.90",
    },
    description:
      "Plataforma de consulta veicular para pessoa física. Histórico de leilão, sinistros, recalls e muito mais.",
  },
} as const;
