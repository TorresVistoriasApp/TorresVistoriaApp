import { APP_NAME } from "@/config/app";

export function Footer() {
  return (
    <footer className="hidden border-t border-border py-5 text-center md:block">
      <p className="ui-microlabel">
        {APP_NAME} · Vistoria cautelar veicular · {new Date().getFullYear()}
      </p>
    </footer>
  );
}
