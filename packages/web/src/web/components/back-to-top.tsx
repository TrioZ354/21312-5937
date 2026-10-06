import { createPortal } from "react-dom";
import { ArrowUp } from "lucide-react";

/** Keep the viewport control outside page animation and clipping containers. */
export function BackToTop() {
  return createPortal(
    <a
      href="#top"
      className="back-to-top"
      aria-label="Вернуться наверх страницы"
      onClick={(event) => {
        event.preventDefault();
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
        document.getElementById("top")?.focus({ preventScroll: true });
      }}
    >
      <ArrowUp size={18} aria-hidden="true" />
      <span>Наверх</span>
    </a>,
    document.body,
  );
}