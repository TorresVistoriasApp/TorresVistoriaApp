import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="hidden border-t border-border bg-background py-4 text-center text-xs text-muted-foreground md:block">
      <p>
        {APP_NAME} · Vistoria cautelar veicular · {new Date().getFullYear()}
      </p>
    </footer>
  );
}
