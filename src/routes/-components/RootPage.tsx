import { debounce } from "@solid-primitives/scheduled";
import {
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
} from "@tabler/icons-solidjs";
import { addSeconds, format } from "date-fns";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";

import { BadApple } from "#/lib/badApple";
import { GameOfLife } from "#/lib/gameOfLife";
import { Lyrics } from "#/lib/lyrics";
import { Visualizer } from "#/lib/visualizer";

export default function RootPage() {
  let gameOfLife: GameOfLife;
  let visualizer: Visualizer;
  let lyrics: Lyrics;
  let badApple: BadApple;
  const [gameOfLifeCanvas, setGameOfLifeCanvas] =
    createSignal<HTMLCanvasElement>();
  const [visualizerCanvas, setVisualizerCanvas] =
    createSignal<HTMLCanvasElement>();
  const [lyricsContainer, setLyricsContainer] = createSignal<HTMLElement>();
  const [elapsedTime, setElapsedTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);

  const progress = () => {
    const dur = duration();
    return dur > 0 ? Math.floor((elapsedTime() / dur) * 100) : 0;
  };

  function formatTime(seconds: number): string {
    return format(addSeconds(new Date(0), Math.floor(seconds)), "m:ss");
  }

  function getGameOfLifeSize() {
    const cellSize = 20;
    const width = Math.floor((window.innerWidth + cellSize) / cellSize);
    const height = Math.floor((window.innerHeight + cellSize) / cellSize);
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
      game: gameOfLife,
    });

    lyrics = new Lyrics();

    visualizer = new Visualizer({
      onEnergyUpdate: (energy) => {
        gameOfLife.energy = energy;
        gameOfLife.updateCanvas();
      },
      onBeat: () => {
        gameOfLife.next();
      },
      onStart: ({ resume, bpm, duration }) => {
        setDuration(duration);
        if (visualizer.music === "bad-apple-ft-sekai") {
          lyrics.startSync(() => visualizer.getTime());
        }
        if (
          visualizer.music === "bad-apple-ft-sekai-off-vocal" ||
          visualizer.music === "bad-apple-ft-sekai"
        ) {
          gameOfLife.startMovingSlow({ stop: true });
          gameOfLife.startRandomPulse({ stop: true });
          gameOfLife.offsetX = 0;
          gameOfLife.offsetY = 0;
          if (!resume) {
            badApple.frameIndex = 0;
          }
          badApple.play();
        } else {
          gameOfLife.startRandomPulse({ stop: true });
          gameOfLife.startMovingSlow({ stop: true });
          gameOfLife.startMoving({ bpm });
        }
      },
      onStop: (pause) => {
        gameOfLife.injectionMask.fill(0);

        if (visualizer.music === "bad-apple-ft-sekai") {
          lyrics.stopSync();
          if (!pause) {
            lyrics.removeLyrics();
          }
        }
        if (
          visualizer.music === "bad-apple-ft-sekai-off-vocal" ||
          visualizer.music === "bad-apple-ft-sekai"
        ) {
          badApple.stop(pause);
          gameOfLife.startRandomPulse();
        } else {
          gameOfLife.startMoving({ stop: true });
          gameOfLife.startMovingSlow();
        }
      },
      onElapsedTimeUpdate(duration) {
        setElapsedTime(duration);
      },
      music: "bad-apple-ft-sekai-off-vocal",
    });

    setGameOfLifeCanvas(gameOfLife.canvas);
    setVisualizerCanvas(visualizer.canvas);
    setLyricsContainer(lyrics.container);
    setDuration(visualizer.getDuration());

    const resize = debounce(() => {
      const { cellSize, width, height } = getGameOfLifeSize();
      gameOfLife.resize(width, height, cellSize);
    }, 250);

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  });

  return (
    <>
      <div class="absolute top-0 left-0 overflow-hidden h-svh w-full">
        {gameOfLifeCanvas()}
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="p-8">{lyricsContainer()}</div>
        </div>
      </div>
      <div class="absolute top-0 left-0 flex gap-1 flex-wrap p-1 ">
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
              visualizer.stop({ pause: true });
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

        <button
          class="btn btn-primary"
          onClick={() => {
            visualizer.nextTract();
          }}
        >
          next track
        </button>

        <button
          class="btn btn-primary"
          onClick={() => {
            visualizer.nextTract({ previous: true });
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
            lyrics.startSync(() => seconds);
          }}
        >
          start lyrics
        </button>
        <button
          class="btn btn-primary"
          onClick={() => {
            lyrics.removeLyrics();
          }}
        >
          remove lyrics
        </button>
      </div>
      <AudioControl
        timeElapsed={`${formatTime(elapsedTime())}`}
        maxDuration={`${formatTime(duration())}`}
        progress={progress()}
      />
      <div class="h-svh w-full"></div>

      <div>{visualizerCanvas()}</div>
    </>
  );
}

function AudioControl(props: {
  timeElapsed: string;
  maxDuration: string;
  progress: number;
}) {
  return (
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-neutral py-4 px-12 rounded-full flex flex-col gap-2 items-center">
      <div class="flex gap-4 items-center">
        <IconPlayerSkipBackFilled class="text-neutral-content cursor-pointer size-5" />
        <div class="rounded-full bg-neutral-content text-neutral cursor-pointer p-1">
          <IconPlayerPlayFilled />
        </div>
        <IconPlayerSkipForwardFilled class="text-neutral-content cursor-pointer size-5" />
      </div>
      <Slider
        timeElapsed={props.timeElapsed}
        maxDuration={props.maxDuration}
        progress={props.progress}
        onChange={() => {}}
      />
    </div>
  );
}

function Slider(props: {
  progress: number;
  onChange: (value: number) => void;
  width?: number;
  timeElapsed?: string;
  maxDuration?: string;
}) {
  const width = props.width ?? 200;
  const step = 1;
  const min = 0;
  const max = 100;
  const [dragging, setDragging] = createSignal(false);
  const [value, setValue] = createSignal(0);
  let trackRef: HTMLDivElement | undefined;

  function clamp(v: number) {
    return Math.min(max, Math.max(min, v));
  }

  function percentFromValue(value: number) {
    return ((value - min) / (max - min)) * 100;
  }

  function valueFromClientX(clientX: number) {
    if (!trackRef) return value();
    const rect = trackRef.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const raw = min + ratio * (max - min);
    return clamp(Math.round(raw / step) * step);
  }

  function handlePointerDown(e: PointerEvent) {
    trackRef?.setPointerCapture(e.pointerId);
    setDragging(true);
    updateValue(e.clientX);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  function handlePointerMove(e: PointerEvent) {
    if (dragging()) {
      updateValue(e.clientX);
    }
  }

  function handlePointerUp(e: PointerEvent) {
    trackRef?.releasePointerCapture(e.pointerId);
    setDragging(false);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  function updateValue(clientX: number) {
    const newValue = valueFromClientX(clientX);
    setValue(newValue);
    props.onChange(newValue);
  }

  createEffect(() => {
    setValue(props.progress);
  });

  onCleanup(() => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  });

  return (
    <div class="flex items-center gap-2">
      <div class="text-neutral-content">{props.timeElapsed}</div>
      <div
        ref={trackRef}
        class="relative ms-2 h-2 bg-neutral-content rounded-full cursor-pointer"
        style={{ width: `${width}px` }}
        onPointerDown={handlePointerDown}
      >
        <div
          class="absolute h-full bg-primary rounded-full"
          style={{ width: `${percentFromValue(value())}%` }}
        />
        <div
          class="absolute top-1/2 size-4 bg-primary rounded-full"
          style={{
            left: `${percentFromValue(value())}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      <div class="text-neutral-content">{props.maxDuration}</div>
    </div>
  );
}
