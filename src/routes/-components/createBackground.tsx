import { debounce } from "@solid-primitives/scheduled";
import {
  IconExternalLink,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconVolume,
  IconVolume3,
} from "@tabler/icons-solidjs";
import { addSeconds, format } from "date-fns";
import { createMemo, createSignal, onMount, Show } from "solid-js";

import { BadApple } from "#/lib/badApple";
import { GameOfLife } from "#/lib/gameOfLife";
import { Lyrics } from "#/lib/lyrics";
import { cn } from "#/lib/utils/cn";
import { tailwindBreakpoints } from "#/lib/utils/tailwindBreakPoint";
import { Visualizer } from "#/lib/visualizer";

import { ScrollingText } from "./ScrollingText";
import { ZagSlider } from "./ZagSlider";

const MAX_VOLUME = 0.3;

export function createBackground() {
  const [playing, setPlaying] = createSignal(false);

  function formatTime(seconds: number): string {
    return format(addSeconds(new Date(0), Math.floor(seconds)), "m:ss");
  }

  const isMobile = window.innerWidth < 640;
  const { cellSize, width, height } = GameOfLife.getGameOfLifeSize();
  const gameOfLife = new GameOfLife({
    width,
    height,
    cellSize,
  });
  gameOfLife.startMovingSlow();

  const badApple = new BadApple({
    game: gameOfLife,
  });

  const lyrics = new Lyrics();

  const visualizer = new Visualizer({
    onEnergyUpdate: (energy) => {
      gameOfLife.energy = energy;
      gameOfLife.updateCanvas();
    },
    onBeat: () => {
      gameOfLife.next();
    },
    onStart: ({ resume, bpm }) => {
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
    onSeek({ target }) {
      badApple.onSeek({ target });
      lyrics.removeLyrics();
    },
    music: "bad-apple-ft-sekai-off-vocal",
    volume: isMobile ? MAX_VOLUME : 0.1,
  });

  onMount(() => {
    const resize = debounce(() => {
      const { cellSize, width, height } = GameOfLife.getGameOfLifeSize();
      gameOfLife.resize(width, height, cellSize);
    }, 250);

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  });

  const progress = () => {
    const dur = visualizer.signal.duration.get();
    return dur > 0
      ? Math.floor((visualizer.signal.elapsedTime.get() / dur) * 100)
      : 0;
  };

  const audioControl = (
    <AudioControl
      timeElapsed={`${formatTime(visualizer.signal.elapsedTime.get())}`}
      maxDuration={`${formatTime(visualizer.signal.duration.get())}`}
      progress={progress()}
      playing={playing()}
      volume={visualizer.signal.volume.get()}
      visualizerCanvas={visualizer.canvas}
      music={visualizer.signal.musicInfo.get()}
      onProgressChange={(progress) => {
        visualizer.seek(undefined, progress);
      }}
      onVolumeChange={(percentage) => {
        const actualVolume = (percentage / 100) * MAX_VOLUME;
        visualizer.setVolume(actualVolume);
        visualizer.signal.volume.set(actualVolume);
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
  );

  return {
    gameOfLife,
    visualizer,
    lyrics,
    badApple,
    audioControl,
  };
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
    link: string;
  };
}) {
  const [previousPercentage, setPreviousPercentage] = createSignal(0);
  const percentage = () => (props.volume / MAX_VOLUME) * 100;
  const matches = tailwindBreakpoints();

  const isMobile = createMemo(() => !matches.sm);

  const ProgressBar = () => (
    <div class="flex items-center gap-4">
      <div class="text-neutral-content font-bitcount-single font-light text-sm">
        {props.timeElapsed}
      </div>
      <ZagSlider
        classNames={{
          root: "w-44 sm:w-64",
          control: "h-1 sm:h-2",
          range: "h-1 sm:h-2",
          thumb: "size-2.5 -translate-y-[3px] sm:size-4 sm:-translate-y-1",
        }}
        value={props.progress}
        onValueChange={props.onProgressChange}
        debounceDuration={250}
      />

      <div class="text-neutral-content font-bitcount-single font-light text-sm">
        {props.maxDuration}
      </div>
    </div>
  );

  return (
    <div class="fixed bottom-2 sm:bottom-8 left-1/2 -translate-x-1/2 bg-neutral py-4 px-8 rounded-xl sm:rounded-full flex flex-col gap-2 items-center w-[calc(100vw-16px)] sm:w-[600px]">
      <div class="flex gap-4 items-center w-full justify-between flex-col sm:flex-row">
        <div class="flex gap-4 items-center">
          <div class="w-64 sm:w-40">
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

          <a href={props.music?.link} target="_blank">
            <IconExternalLink class="text-neutral-content cursor-pointer size-5" />
          </a>
        </div>
        <Show when={isMobile()}>
          <ProgressBar />
        </Show>

        <div class="flex gap-4 items-center justify-between">
          <IconPlayerSkipBackFilled
            onClick={props.onSkipBack}
            class="text-neutral-content cursor-pointer size-5"
          />
          <div
            class="rounded-full bg-neutral-content text-neutral cursor-pointer p-1 flex flex-col items-center justify-center"
            onClick={props.onPlayPause}
          >
            {props.playing ? (
              <IconPlayerPauseFilled class="size-8 sm:size-6" />
            ) : (
              <IconPlayerPlayFilled class="size-8 sm:size-6" />
            )}
          </div>
          <IconPlayerSkipForwardFilled
            onClick={props.onSkipForward}
            class="text-neutral-content cursor-pointer size-5"
          />
        </div>

        <div class="sm:flex items-center gap-4 hidden">
          {props.visualizerCanvas}
          <div class="flex items-center gap-4">
            {percentage() === 0 ? (
              <IconVolume3
                onClick={() => {
                  props.onVolumeChange(previousPercentage());
                }}
                class="text-neutral-content cursor-pointer size-5"
              />
            ) : (
              <IconVolume
                onClick={() => {
                  setPreviousPercentage(percentage());
                  props.onVolumeChange(0);
                }}
                class="text-neutral-content cursor-pointer size-5"
              />
            )}
            <ZagSlider
              value={percentage()}
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

      <Show when={!isMobile()}>
        <ProgressBar />
      </Show>
    </div>
  );
}
