import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full",
        "bg-primary text-white shadow-[0_8px_32px_rgb(234_88_12_/_0.35)]",
        "transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgb(234_88_12_/_0.45)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}
