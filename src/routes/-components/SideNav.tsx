import { createSignal, onMount } from "solid-js";

import { cn } from "#/lib/utils/cn";

gsap.registerPlugin(ScrollTrigger);

export function SideNav(props: { sections: HTMLDivElement[] | undefined }) {
  const [activeIndex, setActiveIndex] = createSignal(0);
  const [hoveredIndex, setHoveredIndex] = createSignal<number | null>(null);

  onMount(() => {
    if (!props.sections) return;

    props.sections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center", // when section reaches center of viewport
        end: "bottom center",
        onEnter: () => setActiveIndex(i),
        onEnterBack: () => setActiveIndex(i),
      });
    });
  });

  return (
    <div
      class={cn(
        "fixed right-8 top-1/2 flex flex-col gap-4 -translate-y-1/2 duration-200 items-center w-9",
        {
          "opacity-0": activeIndex() === 0,
        },
      )}
    >
      {props.sections?.map((_, i) => (
        <button
          class={cn("h-3 duration-300 ", {
            "py-3": activeIndex() === i,
            "cursor-pointer": activeIndex() !== 0,
          })}
          onClick={() => {
            if (activeIndex() === 0) return;
            gsap.to(window, { duration: 1, scrollTo: props.sections?.[i] });
          }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div
            class={cn("h-[1px] w-8 bg-neutral-content duration-100", {
              "h-1": activeIndex() === i || hoveredIndex() === i,
              "w-9": hoveredIndex() === i,
            })}
          ></div>
        </button>
      ))}
    </div>
  );
}
