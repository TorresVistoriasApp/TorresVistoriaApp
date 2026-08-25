import type { ReactNode } from "react";
import { LandingHeader } from "@/modules/torres-consulta/components/landing/landing-header";
import { LandingFooter } from "@/modules/torres-consulta/components/landing/landing-footer";
import { PageSeo, type PageSeoProps } from "@/modules/torres-consulta/components/seo/page-seo";
import {
  MarketingBreadcrumb,
  type BreadcrumbItem,
} from "@/modules/torres-consulta/components/marketing/marketing-breadcrumb";
import { MarketingHero } from "@/modules/torres-consulta/components/marketing/marketing-hero";
import { cn } from "@/shared/lib/utils";

interface MarketingShellProps {
  seo: PageSeoProps;
  breadcrumb?: BreadcrumbItem[];
  hero?: {
    eyebrow?: string;
    title: string;
    description?: string;
    compact?: boolean;
    children?: ReactNode;
  };
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  fullWidth?: boolean;
}

export function MarketingShell({
  seo,
  breadcrumb,
  hero,
  children,
  className,
  contentClassName,
  fullWidth = false,
}: MarketingShellProps) {
  return (
    <>
      <PageSeo {...seo} />
      <div className={cn("consulta-page", className)}>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Ir para o conteúdo
        </a>
        <LandingHeader />
        {hero && <MarketingHero {...hero} />}
        <main
          id="conteudo"
          className={cn(
            "mx-auto px-4 py-12 sm:px-6 sm:py-14 lg:px-8",
            fullWidth ? "max-w-6xl" : "max-w-4xl",
            contentClassName,
          )}
        >
          {breadcrumb && breadcrumb.length > 0 && (
            <MarketingBreadcrumb items={breadcrumb} className="mb-8" />
          )}
          {children}
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
