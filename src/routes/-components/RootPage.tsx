import { GameOfLife } from "#/lib/game-of-life";

export default function RootPage() {
  const gameOfLife = new GameOfLife({
    height: 30,
    width: 30,
    cellSize: 30,
    gap: 6,
  });

  return (
    <div>
      <button
        onClick={() => {
          gameOfLife.next();
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
      <button onClick={() => {}}>toggle</button>

      <div>{gameOfLife.canvas}</div>
    </div>
  );
}
