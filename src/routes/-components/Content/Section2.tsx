import { createSignal, onCleanup, onMount } from "solid-js";

import DockerIcon from "../svgs/DockerIcon";
import NeovimIcon from "../svgs/NeovimIcon";
import NixIcon from "../svgs/NixIcon";
import ReactIcon from "../svgs/ReactIcon";
import TypescriptIcon from "../svgs/TypescriptIcon";

export function Section2() {
  const iconsRef: HTMLDivElement[] = [];
  const textsRef: HTMLDivElement[] = [];

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

  function shuffle(prev: number[]) {
    const next = prev.slice();
    const randomIndex = () => Math.floor(Math.random() * next.length);
    const i = randomIndex();
    let j = randomIndex();
    while (j === i) j = randomIndex();
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  }

  let running = false;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  function startShuffleCycle() {
    if (running) return;
    running = true;

    const totalDuration = 3.5 * 1000; // ms
    let interval = 100; // ms
    const intervalIncrement = 30; // ms

    const start = Date.now();
    function tick() {
      const elapsed = Date.now() - start;
      setOrder((prev) => shuffle(prev));
      interval += intervalIncrement;
      if (elapsed >= totalDuration) {
        stopShuffleCycle();
      } else {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(tick, interval);
      }
    }
    intervalId = setInterval(tick, interval);
  }

  function stopShuffleCycle() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    running = false;
  }

  const textsNodes = [
    <div class="text-lg text-nowrap">youyoumu</div>,
    <div class="text-nowrap">WEB DEVELOPER</div>,
    <div class="text-nowrap">LINUX ENTHUSIAST</div>,
    <div class="text-nowrap opacity-40">WEEB</div>,
  ];

  onMount(() => {
    gsap.to(iconsRef, {
      scrollTrigger: {
        trigger: iconsRef,
        toggleActions: "restart reset restart none",
      },
      delay: 0.5,
      opacity: 5,
      duration: 2,
      stagger: {
        amount: 1,
        from: "random",
      },
      onStart() {
        startShuffleCycle();
      },
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: iconsRef,
        toggleActions: "restart reset restart none",
      },
      delay: 0.5,
    });
    textsRef.forEach((ref) => {
      tl.add(
        gsap
          .timeline()
          .to(ref, {
            opacity: 10,
            duration: 0.1,
          })
          .to(ref, {
            opacity: 0,
            duration: 0.1,
          })
          .to(ref, {
            opacity: 1,
            duration: 0.1,
          }),
        "+=0.1",
      );
    });
  });

  onCleanup(() => {
    stopShuffleCycle();
  });

  return (
    <div class="h-lvh w-full bg-black/10 text-neutral-content flex flex-col items-center justify-center">
      <div class="flex flex-wrap gap-1 max-w-52 sm:max-w-64">
        {iconNodes.map((_, i) => {
          return (
            <div ref={iconsRef[i]} class="opacity-0">
              {iconNodes[order()[i]]}
            </div>
          );
        })}

        <div class="size-20 overflow-visible leading-none">
          {textsNodes.map((_, i) => {
            return (
              <div ref={textsRef[i]} class="opacity-0">
                {textsNodes[i]}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
