import { onCleanup, onMount, type Accessor } from "solid-js";

export function blink(el: Element, options?: { targetOpacity?: number }) {
  const targetOpacity = options?.targetOpacity ?? 1;
  const tl = gsap.timeline();
  tl.to(el, { opacity: 0.3, duration: 0.05 })
    .to(el, { opacity: 0.8, duration: 0.02 })
    .to(el, { opacity: 0.15, duration: 0.1 })
    .to(el, { opacity: 0.9, duration: 0.04 })
    .to(el, { opacity: 0.4, duration: 0.03 })
    .to(el, {
      opacity: targetOpacity,
      duration: 0.02,
      ease: "expo.out",
    })
    .to(el, {
      filter: "brightness(1)",
      duration: 0.15,
    });

  return tl;
}

export const useHoverBlink = (
  elements: Accessor<(Element | undefined)[]>,
  options?: { targetOpacity?: number },
) => {
  onMount(() => {
    elements().forEach((el) => {
      if (!el) return;
      const handler = () => {
        blink(el, options);
      };

      el.addEventListener("mouseenter", handler);
      el.addEventListener("touchstart", handler);
      onCleanup(() => {
        el.removeEventListener("mouseenter", handler);
        el.removeEventListener("touchstart", handler);
      });
    });
  });
};
