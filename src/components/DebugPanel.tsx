import type { createBackground } from "./create-background";

function DebugButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button class="btn btn-primary btn-sm" onClick={onClick}>
      {label}
    </button>
  );
}

export function DebugPanel({ background }: { background: ReturnType<typeof createBackground> }) {
  return (
    <>
      <DebugButton
        label="refresh"
        onClick={() => {
          background.gameOfLife.randomize();
          background.gameOfLife.next();
        }}
      />
      <DebugButton
        label="pulse"
        onClick={() => {
          background.gameOfLife.pulse();
          setTimeout(() => {
            background.gameOfLife.next();
          }, background.gameOfLife.pulseDuration / 2);
        }}
      />
      <DebugButton
        label="benchmark"
        onClick={() => {
          background.gameOfLife.benchmark(1000);
        }}
      />
      <DebugButton
        label="benchmark canvas"
        onClick={() => {
          background.gameOfLife.benchmarkCanvasRender(1000);
        }}
      />
      <DebugButton
        label="play/stop music"
        onClick={() => {
          if (background.visualizer.playing) {
            background.visualizer.stop();
          } else {
            background.visualizer.play();
          }
        }}
      />
      <DebugButton
        label="resume/pause music"
        onClick={() => {
          if (background.visualizer.playing) {
            background.visualizer.stop({ pause: true });
          } else {
            background.visualizer.play({ resume: true });
          }
        }}
      />
      <DebugButton
        label="next"
        onClick={() => {
          background.gameOfLife.next();
        }}
      />
      <DebugButton
        label="inject"
        onClick={() => {
          background.badApple.injectFrameIntoGame(10);
        }}
      />
      <DebugButton
        label="updateCanvas"
        onClick={() => {
          background.gameOfLife.updateCanvas();
        }}
      />
      <DebugButton
        label="next track"
        onClick={() => {
          background.visualizer.skip();
        }}
      />
      <DebugButton
        label="prev track"
        onClick={() => {
          background.visualizer.skip(-1);
        }}
      />
      <DebugButton
        label="start lyrics"
        onClick={() => {
          let seconds = 20;
          setInterval(() => {
            seconds++;
          }, 1000);
          background.lyrics.startSync(() => seconds);
        }}
      />
      <DebugButton
        label="remove lyrics"
        onClick={() => {
          background.lyrics.removeLyrics().catch((e) => {
            console.error(e);
          });
        }}
      />
    </>
  );
}
