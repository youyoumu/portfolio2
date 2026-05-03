import { useGeneralContext } from "#/context/GeneralContext";
import { useIsMobile } from "#/hooks";
import { scrollingChars } from "#/lib/gsap";
import { useSearch } from "@tanstack/solid-router";
import { range, shuffle } from "es-toolkit";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";

import { Heading } from "../../Heading";
import { DockerIcon, NeovimIcon, NixIcon, ReactIcon, TypescriptIcon } from "../../svgs";

type IconRefs = {
  "0": HTMLDivElement | undefined;
  "1": HTMLDivElement | undefined;
  "2": HTMLDivElement | undefined;
  "3": HTMLDivElement | undefined;
  "4": HTMLDivElement | undefined;
};

type TextRefs = {
  "0": HTMLDivElement | undefined;
  "1": HTMLDivElement | undefined;
  "2": HTMLDivElement | undefined;
  "3": HTMLDivElement | undefined;
};

export function Section2() {
  const search = useSearch({ from: "/" });
  const name = createMemo(() => (search().yym === 0 ? "DONNY LAU KIM LENG" : "youyoumu"));

  const { $setGeneral, onSnapCompletes } = useGeneralContext();
  const [$iconRef, $setIconRef] = createStore<IconRefs>({
    "0": undefined,
    "1": undefined,
    "2": undefined,
    "3": undefined,
    "4": undefined,
  });
  const $iconRefs = createMemo(() => [
    $iconRef[0],
    $iconRef[1],
    $iconRef[2],
    $iconRef[3],
    $iconRef[4],
  ]);
  const [$textRef, $setTextRef] = createStore<TextRefs>({
    "0": undefined,
    "1": undefined,
    "2": undefined,
    "3": undefined,
  });
  const $textRefs = createMemo(() => [$textRef[0], $textRef[1], $textRef[2], $textRef[3]]);
  const isMobile = useIsMobile();

  const iconColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-neutral-content")
    .trim();
  const iconClass = "size-16 sm:size-20";
  const icons = [
    <TypescriptIcon class={iconClass} path1Props={{ fill: iconColor }} />,
    <DockerIcon class={iconClass} path1Props={{ fill: iconColor }} />,
    <NixIcon class={iconClass} path1Props={{ fill: iconColor }} path2Props={{ fill: iconColor }} />,
    <ReactIcon class={iconClass} g1Props={{ fill: iconColor }} />,
    <NeovimIcon class={iconClass} path1Props={{ fill: iconColor }} />,
  ] as const;

  const [order, setOrder] = createSignal<number[]>(range(icons.length));

  const texts = [
    <div class="text-lg text-nowrap font-medium">{name()}</div>,
    <div class="text-nowrap">WEB DEVELOPER</div>,
    <div class="text-nowrap">LINUX ENTHUSIAST</div>,
    <div class="text-nowrap opacity-40">WEEB</div>,
  ];

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

  onMount(() => {
    const toggleActions = isMobile() ? "play none none none" : "restart none none none";
    const iconRefs = $iconRefs().filter(Boolean) as HTMLDivElement[];
    gsap.to(iconRefs, {
      scrollTrigger: {
        trigger: iconRefs,
        toggleActions: toggleActions,
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
        trigger: iconRefs,
        toggleActions: toggleActions,
      },
      delay: 0.5,
    });

    const textRefs = $textRefs().filter(Boolean) as HTMLDivElement[];
    textRefs.forEach((ref) => {
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
    <div
      ref={(el) => $setGeneral("section2", el)}
      class="h-lvh w-full bg-black/10 text-neutral-content flex flex-col items-center justify-center relative"
    >
      <div class="flex flex-wrap gap-1 max-w-52 sm:max-w-64">
        <div ref={(ref) => $setIconRef("0", ref)} class="opacity-0">
          {icons[order()[0]]}
        </div>
        <div ref={(ref) => $setIconRef("1", ref)} class="opacity-0">
          {icons[order()[1]]}
        </div>
        <div ref={(ref) => $setIconRef("2", ref)} class="opacity-0">
          {icons[order()[2]]}
        </div>
        <div ref={(ref) => $setIconRef("3", ref)} class="opacity-0">
          {icons[order()[3]]}
        </div>
        <div ref={(ref) => $setIconRef("4", ref)} class="opacity-0">
          {icons[order()[4]]}
        </div>

        <div class="size-20 overflow-visible leading-none">
          <div ref={(ref) => $setTextRef("0", ref)} class="opacity-0">
            {texts[0]}
          </div>
          <div ref={(ref) => $setTextRef("1", ref)} class="opacity-0">
            {texts[1]}
          </div>
          <div ref={(ref) => $setTextRef("2", ref)} class="opacity-0">
            {texts[2]}
          </div>
          <div ref={(ref) => $setTextRef("3", ref)} class="opacity-0">
            {texts[3]}
          </div>
        </div>
      </div>

      <Heading
        style={{ transform: "translateY(-100%)" }}
        class="bottom-10/100 right-10/100"
      >
        STACKS
      </Heading>
    </div>
  );
}
