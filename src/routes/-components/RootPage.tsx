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

  onMount(() => {
    const cellSize = 30;
    const width = Math.floor(window.innerWidth / cellSize);
    const height = Math.floor(window.innerHeight / cellSize);

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
      },
      music: "doodle",
    });

    setGameOfLifeCanvas(gameOfLife.canvas);
    setVisualizerCanvas(visualizer.canvas);
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
