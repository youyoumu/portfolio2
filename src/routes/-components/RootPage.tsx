import { createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { env } from "#/env";
import { hidePortalDiv } from "#/lib/utils/hidePortalDiv";

import { Content } from "./Content";
import { createBackground } from "./createBackground";
import { Curtain } from "./Curtain";
import { DebugPanel } from "./DebugPanel";
import { RevealingText } from "./RevealingText";

export default function RootPage() {
  const [hide, setHide] = createSignal(false);
  const background = createBackground();

  return (
    <div class="relative">
      <Portal
        mount={document.getElementById("background") ?? undefined}
        ref={hidePortalDiv}
      >
        <div class="fixed z-[-10] top-0 left-0 overflow-hidden h-svh w-full">
          {background.gameOfLife.canvas}
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="p-8">{background.lyrics.container}</div>
          </div>
          <div class="absolute top-16 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
            <RevealingText />
          </div>
        </div>
      </Portal>
      <Show when={env.DEV && false}>
        <div class="fixed top-0 left-0 flex gap-1 flex-wrap p-1 ">
          <DebugPanel background={background} />
        </div>
      </Show>
      <Content />
      <Portal
        mount={document.getElementById("audio-control") ?? undefined}
        ref={hidePortalDiv}
      >
        {background.audioControl}
      </Portal>
      <Show when={!hide()}>
        <div class="absolute top-0 left-0 overflow-hidden h-svh w-full">
          <Curtain onHide={() => setHide(true)} />
        </div>
      </Show>
    </div>
  );
}
