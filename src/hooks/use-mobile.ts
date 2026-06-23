import { useEffect, useState } from "react";

const TABLET_MIN = 768;
const DESKTOP_MIN = 1024;

export function useMobile(breakpoint = DESKTOP_MIN) {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : DESKTOP_MIN,
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = width < breakpoint;
  const isTablet = width >= TABLET_MIN && width < 1280;

  return { isMobile, isTablet, width };
}
