import { createSignal, onCleanup, onMount } from "solid-js";

import DockerIcon from "./svgs/DockerIcon";
import NeovimIcon from "./svgs/NeovimIcon";
import NixIcon from "./svgs/NixIcon";
import ReactIcon from "./svgs/ReactIcon";
import TypescriptIcon from "./svgs/TypescriptIcon";

export function Section2() {
  let rootEl: HTMLDivElement | undefined;

  const iconColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-neutral-content")
    .trim();

  const iconClass = "size-16 sm:size-20";

  const iconNodes = [
    <TypescriptIcon class={iconClass} path1Props={{ fill: iconColor }} />,
    <DockerIcon class={iconClass} path1Props={{ fill: iconColor }} />,
    <NixIcon
      class={iconClass}
      path1Props={{ fill: iconColor }}
      path2Props={{ fill: iconColor }}
    />,
    <ReactIcon class={iconClass} g1Props={{ fill: iconColor }} />,
    <NeovimIcon class={iconClass} path1Props={{ fill: iconColor }} />,
  ] as const;

  const [order, setOrder] = createSignal<number[]>(
    Array.from({ length: iconNodes.length }, (_, i) => i),
  );

  function shuffleIndices(prev: number[]) {
    const a = prev.slice();
    if (a.length <= 1) return a;
    // Pick two distinct random positions
    const i = Math.floor(Math.random() * a.length);
    let j = Math.floor(Math.random() * a.length);
    while (j === i) {
      j = Math.floor(Math.random() * a.length);
    }
    // Swap them
    [a[i], a[j]] = [a[j], a[i]];
    return a;
  }

  let observer: IntersectionObserver | null = null;
  let running = false;
  let rafId: number | null = null;

  function startShuffleCycle() {
    if (running) return;
    running = true;

    const totalDuration = 2.5 * 1000; // ms
    let interval = 0.1 * 1000; // ms
    const intervalIncrement = 0.05 * 1000; // ms

    const start = performance.now();
    let lastAt = start;

    function tick(now: number) {
      const elapsed = now - start;

      if (now - lastAt >= interval) {
        setOrder((prev) => shuffleIndices(prev));
        lastAt = now;
        interval += intervalIncrement;
      }

      if (elapsed < totalDuration) {
        rafId = requestAnimationFrame(tick);
      } else {
        // finished
        running = false;
        rafId = null;
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function stopShuffleCycle() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    running = false;
  }

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some(
          (e) => e.isIntersecting && e.intersectionRatio > 0.2,
        );
        if (visible) startShuffleCycle();
      },
      { threshold: [0.5] },
    );
    if (rootEl) observer.observe(rootEl);
  });

  onCleanup(() => {
    stopShuffleCycle();
    observer?.disconnect();
  });

  return (
    <div
      ref={rootEl}
      class="h-svh w-full bg-black/10 text-neutral-content flex flex-col items-center justify-center"
    >
      <div class="flex flex-wrap gap-1 max-w-52 sm:max-w-64">
        {order().map((i) => iconNodes[i])}

        <div class="size-20 overflow-visible leading-none">
          <div class="text-lg text-nowrap">youyoumu</div>
          <div class="text-nowrap">WEB DEVELOPER</div>
          <div class="text-nowrap">LINUX ENTHUSIAST</div>
          <div class="text-nowrap opacity-40">WEEB</div>
        </div>
      </div>
    </div>
  );
}
