import { useId } from "react";
import { useLocation } from "react-router-dom";

/** Referência absoluta para gradientes SVG — corrige url(#id) no Safari/iOS em SPAs. */
export function useSvgGradientRef(prefix: string) {
  const reactId = useId();
  const id = `${prefix}-${reactId.replace(/:/g, "")}`;
  const { pathname } = useLocation();
  const url = `url(${pathname}#${id})`;

  return { id, url };
}
