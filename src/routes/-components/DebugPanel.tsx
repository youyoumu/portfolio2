import type { createBackground } from "./createBackground";

export function DebugPanel({
  background,
}: {
  background: ReturnType<typeof createBackground>;
}) {
  return (
    <div class="fixed top-0 left-0 flex gap-1 flex-wrap p-1 ">
      <button
        class="btn btn-primary"
        onClick={() => {
          background.gameOfLife.randomize();
          background.gameOfLife.next();
        }}
      >
        refresh
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          background.gameOfLife.pulse();
          setTimeout(() => {
            background.gameOfLife.next();
          }, background.gameOfLife.pulseDuration / 2);
        }}
      >
        pulse
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          background.gameOfLife.benchmark(1000);
        }}
      >
        benchmark
      </button>
      <button
        class="btn btn-primary"
        onClick={() => {
          background.gameOfLife.benchmarkCanvasRender(1000);
        }}
      >
        benchmark canvas
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          if (background.visualizer.playing) {
            background.visualizer.stop();
          } else {
            background.visualizer.play();
          }
        }}
      >
        play/stop music
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          if (background.visualizer.playing) {
            background.visualizer.stop({ pause: true });
          } else {
            background.visualizer.play({ resume: true });
          }
        }}
      >
        resume/pause music
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          background.gameOfLife.next();
        }}
      >
        next
      </button>
      <button
        class="btn btn-primary"
        onClick={() => {
          background.badApple.injectFrameIntoGame(10);
        }}
      >
        inject
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          background.gameOfLife.updateCanvas();
        }}
      >
        updateCanvas
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          background.visualizer.nextTract();
        }}
      >
        next track
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          background.visualizer.nextTract({ previous: true });
        }}
      >
        prev track
      </button>

      <button
        class="btn btn-primary"
        onClick={() => {
          let seconds = 20;
          setInterval(() => {
            seconds++;
          }, 1000);
          background.lyrics.startSync(() => seconds);
        }}
      >
        start lyrics
      </button>
      <button
        class="btn btn-primary"
        onClick={() => {
          background.lyrics.removeLyrics();
        }}
      >
        remove lyrics
      </button>
    </div>
  );
}
