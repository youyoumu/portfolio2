import { debounce } from "@solid-primitives/scheduled";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconVolume,
} from "@tabler/icons-solidjs";
import * as slider from "@zag-js/slider";
import { addSeconds, format } from "date-fns";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";

import { BadApple } from "#/lib/badApple";
import { GameOfLife } from "#/lib/gameOfLife";
import { horizontalLoop } from "#/lib/gsap/horizontalLoop";
import { Lyrics } from "#/lib/lyrics";
import { cn } from "#/lib/utils/cn";
import { Visualizer } from "#/lib/visualizer";

import { ZagSlider } from "./ZagSlider";

const MAX_VOLUME = 0.3;

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
  const [playing, setPlaying] = createSignal(false);
  const [music, setMusic] = createSignal<{
    artist: string;
    title: string;
  }>();
  const [volume, setVolume] = createSignal(0);

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
      onStart: ({ resume, bpm, duration, artist, title, isSeek }) => {
        if (!isSeek) {
          setMusic({ artist, title });
        }
        setDuration(duration);
        setPlaying(true);
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
      onStop: ({ pause, isSeek }) => {
        if (!isSeek) {
          gameOfLife.injectionMask.fill(0);
          setPlaying(false);
        }

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
          if (!isSeek) gameOfLife.startRandomPulse();
        } else {
          gameOfLife.startMoving({ stop: true });
          if (!isSeek) gameOfLife.startMovingSlow();
        }
      },
      onElapsedTimeUpdate(duration) {
        setElapsedTime(duration);
      },
      onSeek({ target }) {
        badApple.onSeek({ target });
        lyrics.removeLyrics();
      },
      music: "bad-apple-ft-sekai-off-vocal",
    });

    setGameOfLifeCanvas(gameOfLife.canvas);
    setVisualizerCanvas(visualizer.canvas);
    setLyricsContainer(lyrics.container);

    setDuration(visualizer.getDuration());
    setMusic({
      artist: visualizer.getMusic().artist,
      title: visualizer.getMusic().title,
    });
    setVolume(visualizer.volume);

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
              visualizer.play({ resume: true });
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
        playing={playing()}
        volume={volume()}
        visualizerCanvas={visualizerCanvas()}
        music={music()}
        onProgressChange={(progress) => {
          visualizer.seek(undefined, progress);
        }}
        onVolumeChange={(percentage) => {
          const actualVolume = (percentage / 100) * MAX_VOLUME;
          visualizer.setVolume(actualVolume);
          setVolume(actualVolume);
        }}
        onPlayPause={() => {
          if (visualizer.playing) {
            visualizer.stop({ pause: true });
            setPlaying(false);
          } else {
            visualizer.play({ resume: true });
            setPlaying(true);
          }
        }}
        onSkipBack={() => {
          visualizer.nextTract({ previous: true });
        }}
        onSkipForward={() => {
          visualizer.nextTract();
        }}
      />
      <div class="h-svh w-full"></div>

      {/* <div>{visualizerCanvas()}</div> */}
    </>
  );
}

function AudioControl(props: {
  timeElapsed: string;
  maxDuration: string;
  progress: number;
  playing: boolean;
  volume: number;
  visualizerCanvas: HTMLCanvasElement | undefined;
  onProgressChange: (progress: number) => void;
  onVolumeChange: (percentage: number) => void;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  music?: {
    artist: string;
    title: string;
  };
}) {
  return (
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-neutral py-4 px-12 rounded-full flex flex-col gap-2 items-center">
      <div class="flex gap-4 items-center w-full">
        <div class="flex gap-4 items-center justify-between w-full">
          <div class="w-40">
            <ScrollingText
              trenshold={14}
              text={props.music?.artist ?? "a"}
              classNames={{
                container: "leading-none",
                text: cn(
                  "me-16 font-bitcount-single leading-none text-neutral-content",
                  {
                    invisible: !props.music?.artist?.length,
                  },
                ),
              }}
            />
            <ScrollingText
              trenshold={21}
              text={props.music?.title ?? "a"}
              classNames={{
                container: "leading-none",
                text: cn(
                  "text-base-300/50 text-xs me-16 font-bitcount-single font-light leading-none",
                  {
                    invisible: !props.music?.title?.length,
                  },
                ),
              }}
            />
          </div>
          <IconPlayerSkipBackFilled
            onClick={props.onSkipBack}
            class="text-neutral-content cursor-pointer size-5"
          />
        </div>
        <div
          class="rounded-full bg-neutral-content text-neutral cursor-pointer p-1 flex flex-col items-center justify-center"
          onClick={props.onPlayPause}
        >
          {props.playing ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
        </div>
        <div class="flex gap-4 items-center justify-between w-full">
          <IconPlayerSkipForwardFilled
            onClick={props.onSkipForward}
            class="text-neutral-content cursor-pointer size-5"
          />
          <div class="flex items-center gap-4">
            {props.visualizerCanvas}
            <div class="flex items-center gap-4">
              <IconVolume class="text-neutral-content cursor-pointer size-5" />
              <ZagSlider
                value={(props.volume / MAX_VOLUME) * 100}
                debounceDuration={50}
                onValueChange={props.onVolumeChange}
                classNames={{
                  root: "w-20",
                  thumb: "bg-secondary",
                  range: "bg-secondary",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-neutral-content font-bitcount-single font-light text-sm">
          {props.timeElapsed}
        </div>
        <ZagSlider
          value={props.progress}
          onValueChange={props.onProgressChange}
          debounceDuration={250}
        />

        <div class="text-neutral-content font-bitcount-single font-light text-sm">
          {props.maxDuration}
        </div>
      </div>
    </div>
  );
}

function ScrollingText(props: {
  text: string;
  trenshold: number;
  classNames?: {
    container?: string;
    text: string;
  };
}) {
  let containerRef!: HTMLDivElement;
  let tl: ReturnType<typeof horizontalLoop>;
  const clones: HTMLDivElement[] = [];
  const isScrolling = () => props.text.length > props.trenshold;

  function removeScrolling() {
    tl?.kill();
  }

  createEffect(() => {
    if (!isScrolling()) {
      removeScrolling();
      return;
    }

    setTimeout(() => {
      tl = horizontalLoop(clones, {
        repeat: -1,
        speed: 0.1,
      });

      Observer.create({
        onChangeY(self) {
          let factor = 1.5;
          if (self.deltaY < 0) {
            factor *= -1;
          }
          gsap
            .timeline({
              defaults: {
                ease: "expo.out",
              },
            })
            .to(tl, { timeScale: factor * 2.5, duration: 0.2 })
            .to(tl, { timeScale: factor / 2.5, duration: 1 });
        },
      });
    }, 200);

    return removeScrolling;
  });

  return (
    <div
      ref={containerRef}
      class={cn(
        "relative overflow-hidden whitespace-nowrap max-w-full w-full",
        props.classNames?.container,
      )}
    >
      {new Array(isScrolling() ? 5 : 1).fill(0).map((_, i) => (
        <div
          ref={clones[i]}
          class={cn("inline-block pe-2", props?.classNames?.text)}
        >
          {props.text}
        </div>
      ))}
    </div>
  );
}
