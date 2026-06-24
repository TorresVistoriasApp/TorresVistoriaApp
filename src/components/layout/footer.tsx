import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="hidden border-t border-border/40 py-5 text-center md:block">
      <p className="text-[11px] text-muted-foreground">
        {APP_NAME} · Vistoria cautelar veicular · {new Date().getFullYear()}
      </p>
    </footer>
  );
}
