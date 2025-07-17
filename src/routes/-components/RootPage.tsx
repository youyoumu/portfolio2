import { debounce } from "@solid-primitives/scheduled";
import { createSignal, onMount } from "solid-js";

import { GameOfLife } from "#/lib/gameOfLife";
import { Visualizer } from "#/lib/visualizer";

export default function RootPage() {
  let gameOfLife: GameOfLife;
  let visualizer: Visualizer;
  const [gameOfLifeCanvas, setGameOfLifeCanvas] =
    createSignal<HTMLCanvasElement>();
  const [visualizerCanvas, setVisualizerCanvas] =
    createSignal<HTMLCanvasElement>();

  function getGameOfLifeSize() {
    const cellSize = 30;
    const width = Math.floor(window.innerWidth / cellSize);
    const height = Math.floor(window.innerHeight / cellSize);
    return { cellSize, width, height };
  }

  onMount(() => {
    const { cellSize, width, height } = getGameOfLifeSize();
    gameOfLife = new GameOfLife({
      width,
      height,
      cellSize,
    });

    visualizer = new Visualizer({
      onEnergyUpdate: (energy) => {
        gameOfLife.updateCanvas(undefined, energy);
      },
      onBeat: () => {
        gameOfLife.next();
        setTimeout(() => {
          gameOfLife.next();
        }, 25);

        setTimeout(() => {
          gameOfLife.next();
        }, 50);
      },
      music: "doodle",
    });

    setGameOfLifeCanvas(gameOfLife.canvas);
    setVisualizerCanvas(visualizer.canvas);

    const resize = debounce(() => {
      const { cellSize, width, height } = getGameOfLifeSize();
      gameOfLife.resize(width, height, cellSize);
    }, 250);

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  });

  return (
    <div>
      <button
        class="btn btn-primary"
        onClick={() => {
          gameOfLife.next();
        }}
      >
        next
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          gameOfLife.randomize();
          gameOfLife.next();
        }}
      >
        refresh
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          gameOfLife.pulse();
        }}
      >
        pulse
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          gameOfLife.benchmark(1000);
        }}
      >
        benchmark
      </button>
      <button
        class="btn btn-primary"
        onClick={() => {
          gameOfLife.benchmarkCanvasRender(1000);
        }}
      >
        benchmark canvas
      </button>
      <button class="btn btn-primary" onClick={() => {}}>
        toggle
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          visualizer.play();
          setInterval(() => {
            gameOfLife.tick();
          }, 10);
        }}
      >
        play music
      </button>

      <div>{gameOfLifeCanvas()}</div>
      <div>{visualizerCanvas()}</div>
    </div>
  );
}
