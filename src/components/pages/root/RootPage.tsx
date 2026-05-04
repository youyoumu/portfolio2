import { useGeneralContext } from "#/context/GeneralContext";
import { env } from "#/env";
import { useBackground } from "#/hooks/background";
import { useHoverBlink } from "#/hooks/blink";
import { createMemo, createSignal, type ParentComponent } from "solid-js";
import { Show } from "solid-js";
import { createEffect } from "solid-js";
import { onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { BlurOverlay } from "../../BlurOverlay";
import { Curtain } from "../../Curtain";
import { DebugPanel } from "../../DebugPanel";
import { RevealingText } from "../../RevealingText";
import { SideNav } from "../../SideNav";
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
  useHoverBlink(createMemo(() => [nameRef()]));

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
      <Show when={env.DEV}>
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
      </ContentsPortal>
      <ContentsPortal mount={document.getElementById("curtain")}>
        <div class="fixed top-0 left-0 overflow-hidden h-dvh w-full pointer-events-none">
          <Curtain />
        </div>
        <div class="fixed top-0 left-0 overflow-hidden h-dvh w-full pointer-events-none animate-curtain bg-neutral"></div>
      </ContentsPortal>
    </div>
  );
}

function Section1() {
  const { $setGeneral } = useGeneralContext();

  return <div ref={(el) => $setGeneral("section1", el)} class="h-lvh w-full"></div>;
}
