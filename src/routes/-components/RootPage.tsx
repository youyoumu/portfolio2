import { debounce } from "@solid-primitives/scheduled";
import { createSignal, onMount } from "solid-js";

import { BadApple } from "#/lib/badApple";
import { GameOfLife } from "#/lib/gameOfLife";
import { Visualizer } from "#/lib/visualizer";

export default function RootPage() {
  let gameOfLife: GameOfLife;
  let visualizer: Visualizer;
  let badApple: BadApple;
  const [gameOfLifeCanvas, setGameOfLifeCanvas] =
    createSignal<HTMLCanvasElement>();
  const [visualizerCanvas, setVisualizerCanvas] =
    createSignal<HTMLCanvasElement>();

  function getGameOfLifeSize() {
    // const cellSize = 10;
    // const width = 128;
    // const height = 96;

    const cellSize = 20;
    const width = Math.floor(window.innerWidth / cellSize);
    const height = Math.floor((window.innerHeight - 30) / cellSize);
    return { cellSize, width, height };
  }

  onMount(() => {
    const { cellSize, width, height } = getGameOfLifeSize();
    gameOfLife = new GameOfLife({
      width,
      height,
      cellSize,
    });
    gameOfLife.startMovingSlow();

    badApple = new BadApple({
      src: "/bad-apple-pixel-frame.bin.gz",
      game: gameOfLife,
    });
    badApple.load();

    visualizer = new Visualizer({
      onEnergyUpdate: (energy) => {
        gameOfLife.energy = energy;
        gameOfLife.updateCanvas();
      },
      onBeat: () => {
        gameOfLife.next();
      },
      onStart: (resume, bpm) => {
        if (visualizer.music === "bad-apple-ft-sekai") {
          gameOfLife.startMovingSlow({ stop: true });
          gameOfLife.startRandomPulse({ stop: true });
          gameOfLife.offsetX = 0;
          gameOfLife.offsetY = 0;
          if (!resume) {
            badApple.frameIndex = 0;
          }
          badApple.play();
        } else {
          gameOfLife.startMoving({ bpm });
        }
      },
      onStop: (pause) => {
        gameOfLife.injectionMask.fill(0);
        if (visualizer.music === "bad-apple-ft-sekai") {
          badApple.stop(pause);
          gameOfLife.startRandomPulse();
        } else {
          gameOfLife.startMoving({ stop: true });
          gameOfLife.startMovingSlow();
        }
      },
      music: "bad-apple-ft-sekai",
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
          setTimeout(() => {
            gameOfLife.next();
          }, gameOfLife.pulseDuration / 2);
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

      <button
        class="btn btn-primary"
        onClick={() => {
          if (visualizer.playing) {
            visualizer.stop();
          } else {
            visualizer.play();
          }
        }}
      >
        play/stop music
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          if (visualizer.playing) {
            visualizer.stop(true);
          } else {
            visualizer.play(true);
          }
        }}
      >
        resume/pause music
      </button>

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
          badApple.injectFrameIntoGame(10);
        }}
      >
        inject
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          gameOfLife.updateCanvas();
        }}
      >
        updateCanvas
      </button>

      <div>{gameOfLifeCanvas()}</div>
      <div>{visualizerCanvas()}</div>
    </div>
  );
}
