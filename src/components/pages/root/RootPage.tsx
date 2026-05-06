import { useGeneralContext } from "#/context/GeneralContext";
import { env } from "#/env";
import { useBackground } from "#/hooks/background";
import { useHoverBlink } from "#/hooks/blink";
import { track } from "#/lib/umami";
import { IconCell, IconDice3 } from "@tabler/icons-solidjs";
import { createMemo, createSignal, type ParentComponent } from "solid-js";
import { Show } from "solid-js";
import { createEffect } from "solid-js";
import { onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { BlurOverlay } from "../../BlurOverlay";
import { Curtain } from "../../Curtain";
import { DebugPanel } from "../../DebugPanel";
import { PaperStackTransition } from "../../PaperStackTransition";
import { RevealingText } from "../../RevealingText";
import { SideNav } from "../../SideNav";
import { Section1 } from "./Section1";
import { Section2 } from "./Section2";
import { Section3 } from "./Section3";
import { Section4 } from "./Section4";
import { Section5 } from "./Section5";

const ContentsPortal: ParentComponent<{
  mount: HTMLElement | undefined | null;
  ref?: (ref: HTMLElement) => void;
}> = (props) => {
  return (
    <Portal
      mount={props.mount ?? undefined}
      ref={(ref) => {
        ref.style.display = "contents";
        props.ref?.(ref);
      }}
    >
      {props.children}
    </Portal>
  );
};

export function RootPage() {
  const background = useBackground();
  const { $sections, onSnapCompletes } = useGeneralContext();
  const [crtRef, setCrtRef] = createSignal<HTMLDivElement>();
  const [randomCount, setRandomCount] = createSignal(0);
  const [pulseCount, setPulseCount] = createSignal(0);

  createEffect(() => {
    gsap.to($sections(), {
      scrollTrigger: {
        snap: {
          snapTo: 1 / 4,
          duration: 1,
          directional: false,
        },
        scrub: false,
        onSnapComplete() {
          onSnapCompletes.forEach((f) => f());
        },
      },
    });
  });

  createEffect(() => {
    const ref = crtRef();
    if (!ref) return;
    let idleTimeout: ReturnType<typeof setTimeout>;
    const setIdle = () => {
      ref.style.opacity = "0";
    };
    const handleMouseMove = (e: MouseEvent) => {
      ref.style.setProperty("--cursor-x", `${e.clientX}px`);
      ref.style.setProperty("--cursor-y", `${e.clientY}px`);
      ref.style.opacity = "0.1";
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(setIdle, 1000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    onCleanup(() => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(idleTimeout);
    });
  });

  const [nameRef, setNameRef] = createSignal<HTMLDivElement>();
  const [refreshRef, setRefreshRef] = createSignal<HTMLButtonElement>();
  const [nextRef, setNextRef] = createSignal<HTMLButtonElement>();
  useHoverBlink(createMemo(() => [nameRef(), refreshRef(), nextRef()]));

  return (
    <div class="relative">
      <ContentsPortal mount={document.getElementById("background")}>
        <div class="fixed z-[-10] top-0 left-0 overflow-hidden h-lvh w-full">
          {background.gameOfLife.canvas}
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="p-8">{background.lyrics.container}</div>
          </div>
          <div class="absolute top-16 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
            <RevealingText />
          </div>
          <div class="absolute top-0 left-0 h-lvh w-full">
            <BlurOverlay />
          </div>
          <div class="bg-crt h-lvh w-full absolute top-0 left-0 pointer-events-none"></div>
          <div
            ref={(ref) => setCrtRef(ref)}
            class="bg-crt-mask h-lvh w-full absolute top-0 left-0 transition-opacity duration-500 pointer-events-none"
          ></div>
        </div>
      </ContentsPortal>
      <Show when={env.DEV && false}>
        <div class="fixed top-0 left-0 flex gap-1 flex-wrap p-1 ">
          <DebugPanel background={background} />
        </div>
      </Show>
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />

      <ContentsPortal mount={document.getElementById("fixed-container")}>
        {background.audioControl}
        <SideNav />
        <div
          ref={(ref) => setNameRef(ref)}
          class="fixed top-6 left-6 text-2xl font-extrabold text-neutral-content mix-blend-difference cursor-default"
        >
          yym.
        </div>
        <div class="fixed top-6 right-6 flex gap-4 mix-blend-difference text-neutral-content">
          <button
            ref={(ref) => setRefreshRef(ref)}
            class="cursor-pointer"
            onClick={() => {
              background.gameOfLife.randomize();
              background.gameOfLife.next();
              background.gameOfLife.updateCanvas();
              setRandomCount((c) => c + 1);
              track(`fun-button:randomize`, { count: randomCount() });
            }}
          >
            <IconDice3 class="size-6 hover:rotate-90 transition-transform" />
          </button>
          <button
            ref={(ref) => setNextRef(ref)}
            class="cursor-pointer"
            onClick={() => {
              background.gameOfLife.next();
              background.gameOfLife.pulse();
              setPulseCount((c) => c + 1);
              track(`fun-button:pulse`, { count: pulseCount() });
            }}
          >
            <IconCell class="size-6 hover:rotate-90 transition-transform" />
          </button>
        </div>
        <div class="fixed bottom-6 left-6 flex gap-4 mix-blend-difference text-neutral-content font-jetbrains-mono font-bold text-xl">
          {background.gameOfLife.signal.generation.get()}
        </div>
      </ContentsPortal>
      <ContentsPortal mount={document.getElementById("curtain")}>
        <div class="fixed top-0 left-0 overflow-hidden h-dvh w-full pointer-events-none">
          <Curtain />
        </div>
        <PaperStackTransition />
      </ContentsPortal>
    </div>
  );
}
