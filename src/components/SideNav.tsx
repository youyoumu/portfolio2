import { useGeneralContext } from "#/context/GeneralContext";
import { useIsMobile } from "#/hooks";
import { cn } from "#/lib/utils";
import { createEffect, createSignal, onMount } from "solid-js";

gsap.registerPlugin(ScrollTrigger);

const headings: string[] = ["GAME OF LIFE", "STACKS", "WORKS", "GALLERY", "CONTACT"];

export function SideNav() {
  const { $general, $sections } = useGeneralContext();
  const [activeIndex, setActiveIndex] = createSignal(0);
  const [hoveredIndex, setHoveredIndex] = createSignal<number | null>(null);
  const headingRefs: HTMLDivElement[] = [];
  const isMobile = useIsMobile();

  const headingTweens: gsap.core.Tween[] = [];
  onMount(() => {
    $sections().forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center", // when section reaches center of viewport
        end: "bottom center",
        onEnter: () => setActiveIndex(i),
        onEnterBack: () => setActiveIndex(i),
      });
    });

    if (isMobile()) return;
    headingRefs.forEach((ref, i) => {
      SplitText.create(ref, {
        type: "words,lines",
        autoSplit: true,
        mask: "lines",
        onSplit: (self) => {
          headingTweens[i] = gsap.fromTo(
            self.lines,
            {
              yPercent: 100,
            },
            {
              duration: 1,
              yPercent: 0,
              ease: "expo.out",
              paused: true,
            },
          );
        },
      });
    });
  });

  createEffect(() => {
    if (isMobile()) return;
    const index = hoveredIndex();
    headingTweens.forEach((tween, i) => {
      if (i === index) {
        headingTweens[index]?.duration(1);
        headingTweens[index]?.play();
        return;
      }
      tween.duration(0.2);
      tween.reverse();
    });
  });

  return (
    <div
      class={cn(
        "fixed right-8 top-1/2 flex flex-col gap-4 -translate-y-1/2 duration-200 items-center",
        {
          "opacity-0 xl:opacity-100": activeIndex() === 3,
          "opacity-0": activeIndex() === 0 || (activeIndex() === 3 && isMobile()),
          "right-4": isMobile(),
        },
      )}
    >
      {(
        [
          $general.section1,
          $general.section2,
          $general.section3,
          $general.section4,
          $general.section5,
        ] as const
      ).map((section, i) => (
        <button
          class={cn("h-3 duration-300 relative", {
            "py-3": activeIndex() === i,
            "cursor-pointer": activeIndex() !== 0,
          })}
          onClick={() => {
            if (activeIndex() === 0) return;
            gsap.to(window, { duration: 1, scrollTo: section });
          }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div
            class={cn("h-[1px] w-8 bg-neutral-content duration-100", {
              "h-1": activeIndex() === i || (hoveredIndex() === i && !isMobile()),
            })}
          ></div>
          <div
            ref={headingRefs[i]}
            class="hidden xl:block absolute top-1/2 right-0 -translate-x-12 -translate-y-1/2 text-sm text-neutral-content text-nowrap leading-none pointer-events-none"
          >
            {headings[i]}
          </div>
        </button>
      ))}
    </div>
  );
}
