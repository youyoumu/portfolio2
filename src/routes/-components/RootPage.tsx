import { createSignal } from "solid-js";

import { GameOfLife } from "#/lib/game-of-life";

export default function RootPage() {
  const gameOfLife = new GameOfLife({ height: 1000, width: 1000 });
  gameOfLife.randomize();
  const [element, setElement] = createSignal(gameOfLife.getCode());
  return (
    <div>
      <button
        onClick={() => {
          gameOfLife.next();
          setElement(gameOfLife.getCode());
        }}
      >
        next
      </button>

      <button
        onClick={() => {
          console.log("benchmarking");
          const { generationsPerSecond } = gameOfLife.benchmark(10);
          console.log(`Generations per second: ${generationsPerSecond}`);
        }}
      >
        benchmark
      </button>
      <div>{element()}</div>
    </div>
  );
}
