import { createEffect, createSignal, onMount, Show } from "solid-js";

import { env } from "#/env";
import { GameOfLife } from "#/lib/gameOfLife";

export function Curtain() {
  const { cellSize, width, height } = GameOfLife.getGameOfLifeSize(2.5);
  const [hide, setHide] = createSignal(false);
  const gameOfLife = new GameOfLife({
    width,
    height,
    cellSize,
  });
  gameOfLife.grid.fill(0);
  gameOfLife.randomize(0.005);
  gameOfLife.energy = 1;
  gameOfLife.transparentCell = true;
  gameOfLife.bgColor = gameOfLife.cellColor;
  gameOfLife.updateCanvas();

  let intervalId: ReturnType<typeof setInterval> | null = null;
  onMount(() => {
    intervalId = setInterval(() => {
      if (gameOfLife.density === 1) {
        setHide(true);
      }
      gameOfLife.next2();
      gameOfLife.updateCanvas();
    }, 20);
  });

  createEffect(() => {
    if (hide()) {
      clearInterval(intervalId!);
    }
  });

  return (
    <>
      {!hide() && gameOfLife.canvas}
      <Show when={env.DEV}>
        <DebugPanel gameOfLife={gameOfLife} />
      </Show>
    </>
  );
}

function DebugPanel({ gameOfLife }: { gameOfLife: GameOfLife }) {
  return (
    <div class="fixed bottom-0 left-0 flex gap-1 flex-wrap p-1 ">
      <button
        class="btn btn-primary"
        onClick={() => {
          gameOfLife.next2();
          gameOfLife.updateCanvas();
        }}
      >
        next
      </button>
    </div>
  );
}
