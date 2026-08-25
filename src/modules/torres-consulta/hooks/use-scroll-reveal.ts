import { useEffect, useRef, useState } from "react";

/**
 * Um único IntersectionObserver atende toda a página: em aparelhos antigos o custo
 * de dezenas de observers independentes é maior que o da própria animação.
 */
const callbacks = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | null = null;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    { threshold: 0, rootMargin: "0px 0px -8% 0px" },
  );
  return observer;
}

/** Fora do navegador ou sem suporte, o conteúdo entra já visível. */
function shouldAnimate() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(() => !shouldAnimate());

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    callbacks.set(el, () => setVisible(true));
    const io = getObserver();
    io.observe(el);

    return () => {
      callbacks.delete(el);
      io.unobserve(el);
    };
  }, [visible]);

  return { ref, visible };
}
