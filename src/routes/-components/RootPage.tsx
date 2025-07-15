import { GameOfLife } from "#/lib/game-of-life";
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
    bpm: 160,
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
          visualizer.loadAndPlay("/music/doodle.mp3");
          gameOfLife.run(60000 / 160);
        }}
      >
        play music
      </button>

      <div>{gameOfLife.canvas}</div>
      <div>{visualizer.canvas}</div>
    </div>
  );
}
