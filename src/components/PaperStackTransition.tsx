import { blink } from "#/hooks/blink";
import { CustomEase } from "gsap/CustomEase";
import { createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";

declare const __COMMIT_SHA__: string;

const PAPER_SHEETS = [
  {
    color: "color-mix(in oklch, var(--color-neutral) 100%, var(--color-neutral-content))",
  },
  {
    color: "color-mix(in oklch, var(--color-neutral) 85%, var(--color-neutral-content))",
  },
  {
    color: "color-mix(in oklch, var(--color-neutral) 70%, var(--color-neutral-content))",
  },
  {
    color: "color-mix(in oklch, var(--color-neutral) 95%, var(--color-neutral-content))",
  },
] as const;

export function PaperStackTransition() {
  const [$containerRef, $setContainerRef] = createSignal<HTMLDivElement>();
  const [$sheetRefs, $setSheetRefs] = createStore<Record<string, HTMLDivElement>>({});
  const [$progressRef, $setProgressRef] = createSignal<HTMLDivElement>();
  const [$percentRef, $setPercentRef] = createSignal<HTMLSpanElement>();
  const [$statusLineRef, $setStatusLineRef] = createSignal<HTMLDivElement>();
  const [$statusText, $setStatusText] = createSignal("Initializing...");

  const ease = CustomEase.create(
    "custom",
    "M0,0 C0.267,0.022 0.392,0.048 0.458,0.139 0.516,0.219 0.52,0.255 0.552,0.398 0.577,0.51 0.584,0.588 0.608,0.706 0.637,0.852 0.75,0.973 1,1 ",
  );

  onMount(() => {
    const containerRef = $containerRef();
    const sheetRefs = Object.values($sheetRefs);
    const progressRef = $progressRef();
    const percentRef = $percentRef();

    if (!containerRef || sheetRefs.length === 0) return;
    const tl = gsap.timeline();

    const PROGRESS_DURATION = 3;
    if (progressRef && percentRef) {
      let markedComplete = false;
      tl.to(progressRef, {
        scaleX: 1,
        duration: PROGRESS_DURATION,
        ease: "power2.inOut",
      });
      tl.to(
        { val: 0 },
        {
          val: 100,
          duration: PROGRESS_DURATION,
          ease: "power2.inOut",
          onUpdate: function () {
            const value = Math.floor(this.targets()[0].val);
            percentRef.textContent = value.toString();

            if (!markedComplete && value >= 100) {
              markedComplete = true;
              $setStatusText("Complete");
            }
          },
          onComplete: () => {
            percentRef.textContent = "100";
            $setStatusText("Complete");
            const statusLineRef = $statusLineRef();
            if (statusLineRef) {
              blink(statusLineRef, { targetOpacity: 0.4 });
            }
          },
        },
        "<",
      );
    }

    const position = (i: number, length: number) => {
      if (i === 0) return "+=0.3";
      if (i === length - 1) return "<0.75";
      return "<0.15";
    };

    sheetRefs
      .slice()
      .reverse()
      .forEach((sheet, index) => {
        tl.to(
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
      duration: 0.5,
    });

    onCleanup(() => {
      tl.kill();
    });
  });

  return (
    <div
      class="h-lvh fixed inset-0 z-20 overflow-hidden pointer-events-none"
      ref={$setContainerRef}
    >
      {PAPER_SHEETS.map((sheet, i) => (
        <div
          ref={(ref) => $setSheetRefs(i.toString(), ref)}
          class="paper-sheet absolute inset-[-8%] overflow-hidden"
          style={{
            "background-color": sheet.color,
          }}
        >
          {i === PAPER_SHEETS.length - 1 && (
            <div class="h-full w-full flex flex-col items-center justify-center font-jetbrains-mono text-neutral-content/40 p-12">
              <div class="text-8xl sm:text-9xl font-yuji-syuku opacity-15 mb-12 select-none">
                御挨拶
              </div>

              <div class="flex flex-col items-center gap-2">
                <div class="w-48 sm:w-64 h-px bg-neutral-content/10 relative overflow-hidden">
                  <div
                    ref={$setProgressRef}
                    class="absolute inset-0 bg-neutral-content/40 origin-left scale-x-0"
                  />
                </div>
                <div
                  ref={$setStatusLineRef}
                  class="flex items-center justify-center gap-1 text-xs uppercase tracking-widest opacity-40"
                >
                  <span class="inline-block w-[18ch] text-left">{$statusText()}</span>
                  <span ref={$setPercentRef} class="inline-block w-[3ch] text-right tabular-nums">
                    0
                  </span>
                  <span>%</span>
                </div>
              </div>

              <div class="absolute bottom-48 sm:bottom-32 left-1/2 -translate-x-1/2 opacity-30 select-none flex gap-2 items-center">
                <div class="text-xs font-bold">[V2.0.0]</div>
                <div>-</div>
                <div class="text-xs leading-none">
                  {typeof __COMMIT_SHA__ !== "undefined" ? __COMMIT_SHA__.slice(0, 7) : "DEV_BUILD"}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
