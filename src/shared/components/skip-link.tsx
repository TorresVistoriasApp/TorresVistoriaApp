import { cn } from "@/shared/lib/utils";

export const MAIN_CONTENT_ID = "conteudo";

type SkipLinkProps = {
  href?: string;
  children?: string;
  className?: string;
};

/** Link de teclado para pular a navegação e ir ao conteúdo principal. */
export function SkipLink({
  href = `#${MAIN_CONTENT_ID}`,
  children = "Ir para o conteúdo",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70]",
        "focus:rounded-md focus:bg-primary focus:px-4 focus:py-2",
        "focus:text-sm focus:font-semibold focus:text-primary-foreground",
        className,
      )}
    >
      {children}
    </a>
  );
}
