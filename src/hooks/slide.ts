import { onCleanup, onMount, type Accessor } from "solid-js";

export function slide(
  el: Element,
  options?: { targetOpacity?: number; start: string; end: string },
) {
  const split = new SplitText(el, { type: "words" });
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: options?.start ?? "top 85%",
      end: options?.end ?? "bottom 15%",
      scrub: true,
    },
  });

  tl.fromTo(
    split.words,
    {
      opacity: 0,
      x: 30,
      stagger: 0.1,
    },
    {
      opacity: options?.targetOpacity ?? 1,
      x: 0,
      stagger: 0.1,
    },
  )
    .to(split.words, {
      opacity: options?.targetOpacity ?? 1,
      x: 0,
      stagger: 0.1,
    })
    .to(
      split.words,
      {
        opacity: 0,
        x: -30,
        stagger: 0.1,
      },
      "+=0.2",
    );

  return split;
}

export function useSlide(
  el: Accessor<Element | undefined>,
  options?: { targetOpacity?: number; start: string; end: string },
) {
  onMount(() => {
    const ref = el();
    if (!ref) return;
    const split = slide(ref, options);

    onCleanup(() => {
      split.revert();
    });
  });
}
