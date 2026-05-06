import { AudioControl } from "#/components/AudioControl";
import { useGeneralContext } from "#/context/GeneralContext";
import { BadApple } from "#/lib/bad-apple";
import { GameOfLife } from "#/lib/game-of-life";
import { Lyrics } from "#/lib/lyrics";
import { track } from "#/lib/umami";
import { getDynamicViewportDelta } from "#/lib/utils";
import { badAppleLyrics } from "#/lib/vars";
import { Visualizer } from "#/lib/visualizer";
import { debounce } from "@solid-primitives/scheduled";
import { createSignal, onMount } from "solid-js";

import { useIsMobile } from "./tailwind-breakpoints";

const MAX_VOLUME = 0.3;

function formatTime(seconds: number): string {
  const mins = Math.floor(Math.floor(seconds) / 60);
  const secs = Math.floor(seconds) % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function useBackground() {
  const { $setGeneral } = useGeneralContext();
  const [playing, setPlaying] = createSignal(false);
  const isMobile = useIsMobile();

  const { cellSize, width, height } = GameOfLife.getGameOfLifeSize(1, isMobile());
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
      visualizer.stopIdleRender();
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
        badApple.startSync(() => visualizer.getTime());
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
      visualizer.startIdleRender();

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
    onMusicEnd: () => {
      track("visualizer:music-end", { music: visualizer.music });
    },
    music: "bad-apple-ft-sekai-off-vocal",
    volume: isMobile() ? MAX_VOLUME : 0.1,
  });

  onMount(() => {
    visualizer.startIdleRender();
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
        const { cellSize, width, height } = GameOfLife.getGameOfLifeSize(1, isMobile());
        gameOfLife.resize(width, height, cellSize);
      }
    }, 250);

    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      visualizer.stopIdleRender();
    };
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
        track.d("audio-control:progress", { progress });
      }}
      onVolumeChange={(percentage) => {
        const actualVolume = (percentage / 100) * MAX_VOLUME;
        visualizer.setVolume(actualVolume);
        visualizer.signal.volume.set(actualVolume);
        track.d("audio-control:volume", { percentage });
      }}
      onPlayPause={() => {
        $setGeneral("musicPlayed", true);
        if (visualizer.playing) {
          visualizer.stop({ pause: true });
          setPlaying(false);
        } else {
          visualizer.play({ resume: true });
          setPlaying(true);
        }
        track(`audio-control:${playing() ? "play" : "pause"}`, { music: visualizer.music });
      }}
      onSkipBack={() => {
        $setGeneral("musicPlayed", true);
        visualizer.skip(-1);
        track("audio-control:skip-back", { music: visualizer.music });
      }}
      onSkipForward={() => {
        $setGeneral("musicPlayed", true);
        visualizer.skip();
        track("audio-control:skip-forward", { music: visualizer.music });
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
