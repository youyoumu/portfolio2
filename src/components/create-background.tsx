import { useGeneralContext } from "#/context/GeneralContext";
import { BadApple } from "#/lib/bad-apple";
import { GameOfLife } from "#/lib/game-of-life";
import { Lyrics } from "#/lib/lyrics";
import { getDynamicViewportDelta, isMobile } from "#/lib/utils";
import { badAppleLyrics } from "#/lib/vars";
import { Visualizer } from "#/lib/visualizer";
import { debounce } from "@solid-primitives/scheduled";
import { createSignal, onMount } from "solid-js";

import { AudioControl } from "./AudioControl";

const MAX_VOLUME = 0.3;

function formatTime(seconds: number): string {
  const mins = Math.floor(Math.floor(seconds) / 60);
  const secs = Math.floor(seconds) % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function createBackground() {
  const [, setStore] = useGeneralContext();
  const [playing, setPlaying] = createSignal(false);

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

  const lyrics = new Lyrics({ lyrics: badAppleLyrics });

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
          lyrics.removeLyrics().catch((e) => {
            console.error(e);
          });
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
      lyrics.removeLyrics().catch((e) => {
        console.error(e);
      });
    },
    music: "bad-apple-ft-sekai-off-vocal",
    volume: isMobile() ? MAX_VOLUME : 0.1,
  });

  onMount(() => {
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    const resize = debounce(() => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      let shouldResize = true;

      if (isMobile()) {
        const widthChanged = newWidth !== lastWidth;
        const heightDelta = Math.abs(newHeight - lastHeight);
        shouldResize = widthChanged || heightDelta > getDynamicViewportDelta();
      }

      if (shouldResize) {
        lastWidth = newWidth;
        lastHeight = newHeight;
        const { cellSize, width, height } = GameOfLife.getGameOfLifeSize();
        gameOfLife.resize(width, height, cellSize);
      }
    }, 250);

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  });

  const progress = () => {
    const dur = visualizer.signal.duration.get();
    return dur > 0 ? Math.floor((visualizer.signal.elapsedTime.get() / dur) * 100) : 0;
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
        setStore("musicPlayed", true);
        if (visualizer.playing) {
          visualizer.stop({ pause: true });
          setPlaying(false);
        } else {
          visualizer.play({ resume: true });
          setPlaying(true);
        }
      }}
      onSkipBack={() => {
        setStore("musicPlayed", true);
        visualizer.skip(-1);
      }}
      onSkipForward={() => {
        setStore("musicPlayed", true);
        visualizer.skip();
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
