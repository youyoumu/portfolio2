import { createEffect, createSignal, onCleanup } from "solid-js";

import { GameOfLife } from "#/lib/game-of-life";

export default function RootPage() {
  const gameOfLife = new GameOfLife({ height: 100, width: 100 });
  gameOfLife.randomize();
  const [element, setElement] = createSignal(gameOfLife.getCanvas());
  const [play, setPlay] = createSignal(true);

  let id: ReturnType<typeof setTimeout>;
  function togglePlay() {
    setPlay(!play());
    if (play()) {
      id = setInterval(() => {
        gameOfLife.next();
        setElement(gameOfLife.getCanvas());
      }, 1000);
    } else {
      if (id) clearInterval(id!);
    }
  }

  onCleanup(() => {
    if (id) clearInterval(id);
  });

  return (
    <div>
      <button
        onClick={() => {
          gameOfLife.next();
          setElement(gameOfLife.getCanvas());
        }}
      >
        next
      </button>

      <button
        onClick={() => {
          gameOfLife.benchmark(1000);
        }}
      >
        benchmark
      </button>
      <button
        onClick={() => {
          gameOfLife.benchmarkCanvasRender(1000);
        }}
      >
        benchmark canvas
      </button>
      <button
        onClick={() => {
          togglePlay();
        }}
      >
        toggle
      </button>

      <div>{element()}</div>
    </div>
  );
}
