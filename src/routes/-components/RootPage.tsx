import { createSignal } from "solid-js";

import { GameOfLife } from "#/lib/game-of-life";

export default function RootPage() {
  const gameOfLife = new GameOfLife({ height: 40, width: 40 });
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
      <div>{element()}</div>
    </div>
  );
}
