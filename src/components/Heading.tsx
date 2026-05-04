import { useGeneralContext } from "#/context/GeneralContext";
import { scrollingChars } from "#/lib/gsap";
import { cn } from "#/lib/utils";
import { createSignal, onMount } from "solid-js";

export function Heading(props: {
  style?: { transform: string };
  class?: string;
  children: string;
  flipIndex?: number;
  flipDirection?: "horizontal" | "vertical";
}) {
  const { onSnapCompletes } = useGeneralContext();
  const [heading1, setHeading1] = createSignal<HTMLDivElement>();
  const [heading2, setHeading2] = createSignal<HTMLDivElement>();

  onMount(() => {
    const h1 = heading1();
    const h2 = heading2();
    if (!h1 || !h2) return;

    const heading = [h1, h2];
    gsap.to(heading, {
      yPercent: 200,
      ease: "none",
      scrollTrigger: {
        trigger: heading,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    const { tweenRestart } = scrollingChars({
      heading1: h1,
      heading2: h2,
      flipIndex: props.flipIndex,
      flipDirection: props.flipDirection,
    });
    onSnapCompletes.add(tweenRestart);
  });

  return (
    <>
      <div
        ref={setHeading1}
        class={cn(
          "text-nowrap leading-[0.85] font-bebas-neue tracking-wide absolute text-[15svw] lg:text-[10svw] text-neutral-content opacity-50 pointer-events-none",
          props.class,
        )}
        style={{ ...props.style, perspective: "1000px" }}
      >
        {props.children}
      </div>
      <div
        ref={setHeading2}
        class={cn(
          "text-nowrap leading-[0.85] font-bebas-neue tracking-wide absolute text-[15svw] lg:text-[10svw] text-neutral-content opacity-50 pointer-events-none",
          props.class,
        )}
        style={{ ...props.style, perspective: "1000px" }}
      >
        {props.children}
      </div>
    </>
  );
}
