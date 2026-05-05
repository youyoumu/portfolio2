import { CustomEase } from "gsap/CustomEase";
import { createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";

const PAPER_SHEETS = [
  {
    color: "color-mix(in oklch, var(--color-neutral) 100%, var(--color-neutral-content))",
  },
  {
    color: "color-mix(in oklch, var(--color-neutral) 95%, var(--color-neutral-content))",
  },
  {
    color: "color-mix(in oklch, var(--color-neutral) 90%, var(--color-neutral-content))",
  },
  {
    color: "color-mix(in oklch, var(--color-neutral) 95%, var(--color-neutral-content))",
  },
] as const;

export function PaperStackTransition() {
  const [$containerRef, $setContainerRef] = createSignal<HTMLDivElement>();
  const [$sheetRefs, $setSheetRefs] = createStore<Record<string, HTMLDivElement>>({});

  const ease = CustomEase.create(
    "custom",
    "M0,0 C0.267,0.022 0.392,0.048 0.458,0.139 0.516,0.219 0.52,0.255 0.552,0.398 0.577,0.51 0.584,0.588 0.608,0.706 0.637,0.852 0.75,0.973 1,1 ",
  );

  onMount(() => {
    const containerRef = $containerRef();
    const sheetRefs = Object.values($sheetRefs);
    if (!containerRef || sheetRefs.length === 0) return;
    const tl = gsap.timeline();

    const position = (i: number, length: number) => {
      if (i === 0) return "+=0.2";
      if (i === length - 1) return "<0.75";
      return "<0.15";
    };

    sheetRefs
      .slice()
      .reverse()
      .forEach((sheet, index) => {
        tl.delay(0.5).to(
          sheet,
          {
            yPercent: -100,
            duration: 1.5,
            ease: ease,
          },
          position(index, sheetRefs.length),
        );
      });

    tl.to(containerRef, {
      opacity: 0,
    });

    onCleanup(() => {
      tl.kill();
    });
  });

  return (
    <div class="fixed inset-0 z-20 overflow-hidden pointer-events-none" ref={$setContainerRef}>
      {PAPER_SHEETS.map((sheet, i) => (
        <div
          ref={(ref) => $setSheetRefs(i.toString(), ref)}
          class="paper-sheet absolute inset-[-8%] overflow-hidden"
          style={{
            "background-color": sheet.color,
          }}
        ></div>
      ))}
    </div>
  );
}
