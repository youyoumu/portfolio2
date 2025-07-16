import { GameOfLife } from "#/lib/gameOfLife";
import { Visualizer } from "#/lib/visualizer";

export default function RootPage() {
  const gameOfLife = new GameOfLife({
    height: 10,
    width: 10,
    cellSize: 50,
  });

  const visualizer = new Visualizer({
    onEnergyUpdate: (energy) => {
      gameOfLife.updateCanvas({ energy });
    },
    onBeat: () => {
      gameOfLife.next();
    },
    music: "doodle",
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
        }}
      >
        play music
      </button>

      <div>{gameOfLife.canvas}</div>
      <div>{visualizer.canvas}</div>
    </div>
  );
}
