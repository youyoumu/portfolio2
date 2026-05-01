import { GameOfLife } from "#/lib/game-of-life";
import { isMobile } from "#/lib/utils";
import { onMount } from "solid-js";

export function Curtain() {
  const { cellSize, width, height } = GameOfLife.getGameOfLifeSize(isMobile() ? 1.5 : 2.0);
  const gameOfLife = new GameOfLife({
    width,
    height,
    cellSize,
    shape: "square",
  });
  gameOfLife.grid.fill(0);
  gameOfLife.randomize(0.2);
  gameOfLife.energy = 1;
  gameOfLife.transparentCell = true;
  gameOfLife.bgColor = gameOfLife.cellColor;
  gameOfLife.next2();
  gameOfLife.updateCanvas();

  let intervalId: ReturnType<typeof setInterval> | undefined;
  onMount(() => {
    setTimeout(() => {
      intervalId = setInterval(() => {
        if (gameOfLife.density === 1) {
          clearInterval(intervalId);
        }
        gameOfLife.next2();
        gameOfLife.updateCanvas();
      }, 24);
    }, 1000);
  });

  return <>{gameOfLife.canvas}</>;
}
