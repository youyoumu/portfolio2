import { useGeneralContext } from "#/context/GeneralContext";
import { env } from "#/env";
import { useBackground } from "#/hooks/background";
import { hidePortalDiv } from "#/lib/utils";
import { Show } from "solid-js";
import { createEffect } from "solid-js";
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

export function RootPage() {
  const background = useBackground();
  const { $sections, onSnapCompletes } = useGeneralContext();

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

  return (
    <div class="relative">
      <Portal mount={document.getElementById("background") ?? undefined} ref={hidePortalDiv}>
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
          <div class="bg-crt h-lvh w-full absolute top-0 left-0"></div>
        </div>
      </Portal>
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
      <Portal mount={document.getElementById("audio-control") ?? undefined} ref={hidePortalDiv}>
        {background.audioControl}
        <SideNav />
      </Portal>
      <Portal mount={document.getElementById("curtain") ?? undefined} ref={hidePortalDiv}>
        <div class="fixed top-0 left-0 overflow-hidden h-dvh w-full pointer-events-none">
          <Curtain />
        </div>
      </Portal>
    </div>
  );
}

function Section1() {
  const { $setGeneral } = useGeneralContext();

  return <div ref={(el) => $setGeneral("section1", el)} class="h-lvh w-full"></div>;
}
