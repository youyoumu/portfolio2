import { createSignal, Show } from "solid-js";

import { env } from "#/env";

import { createBackground } from "./createBackground";
import { Curtain } from "./Curtain";
import { DebugPanel } from "./DebugPanel";

export default function RootPage() {
  const [hide, setHide] = createSignal(false);
  const background = createBackground();

  return (
    <>
      <div class="absolute top-0 left-0 overflow-hidden h-svh w-full">
        {background.gameOfLife.canvas}
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="p-8">{background.lyrics.container}</div>
        </div>
      </div>
      <Show when={env.DEV}>
        <DebugPanel background={background} />
      </Show>
      <div class="h-svh w-full"></div>
      {background.audioControl}
      <Show when={!hide()}>
        <div class="absolute top-0 left-0 overflow-hidden h-svh w-full">
          <Curtain onHide={() => setHide(true)} />
        </div>
      </Show>
    </>
  );
}
