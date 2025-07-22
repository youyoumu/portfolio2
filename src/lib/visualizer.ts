import { createSignal } from "solid-js";

import { signalToObj } from "./utils/signalToObj";
import { withInit } from "./utils/withInit";

const musicList = {
  doodle: {
    src: "/music/doodle.webm",
    artist: "Zachz Winner",
    title: "doodle",
    link: "https://youtu.be/-iM7KCEt5zs?si=HrqlfZiWwmGMJI7n",
    bpm: 160,
    startOffset: 0,
    firstBeatOffset: 0.5,
    lowFreqStart: 0,
    lowFreqEnd: 64,
    duration: 74,
  },
  discoupled: {
    src: "/music/discopled.webm",
    artist: "Zachz Winner",
    title: "discopled",
    link: "https://youtu.be/UWpUCmXokgM?si=dIlTlGougOkcY3bT",
    bpm: 152,
    startOffset: 0,
    firstBeatOffset: 0,
    lowFreqStart: 0,
    lowFreqEnd: 64,
    duration: 86,
  },
  "bad-apple-ft-sekai-off-vocal": {
    src: "/music/bad-apple-ft-sekai-off-vocal.webm",
    bpm: 138,
    artist: "25-ji, Nightcord de",
    title: "(off vocal) Bad Apple!! feat.SEKAI",
    link: "https://youtu.be/h87WUOEPUCg?si=jTRAN3sUJ1XVZQBh",
    startOffset: 0,
    firstBeatOffset: 1,
    lowFreqStart: 0,
    lowFreqEnd: 64,
    duration: 229,
  },
  "bad-apple-ft-sekai": {
    src: "/music/bad-apple-ft-sekai.webm",
    bpm: 138,
    artist: "25-ji, Nightcord de",
    title: "Bad Apple!! feat.SEKAI",
    link: "https://youtu.be/v-fc1zv31zE?si=9NauF-kKzT6IqQsx",
    startOffset: 1,
    firstBeatOffset: 1,
    lowFreqStart: 16,
    lowFreqEnd: 18,
    duration: 231,
  },
};

const audioBufferCache = new Map<string, AudioBuffer>();

interface VisualizerInit {
  onEnergyUpdate: (energy: number) => void;
  onBeat: () => void;
  onStart: (param: {
    resume: boolean;
    bpm: number;
    duration: number;
    isSeek: boolean;
    music: (typeof musicList)[keyof typeof musicList];
  }) => void;
  onStop: (param: { pause: boolean; isSeek: boolean }) => void;
  onSeek: ({ target }: { target: number }) => void;
  music: keyof typeof musicList;
  volume?: number;
}

export class Visualizer extends withInit<VisualizerInit>() {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  source: AudioBufferSourceNode | null = null;
  freqData: Uint8Array;
  gainNode: GainNode;
  lowFreqBins = 64;
  fadeDuration = 0.5;
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  colors = Array.from(
    { length: this.lowFreqBins },
    (_, i) => `hsl(${(i / this.lowFreqBins) * 360}, 100%, 50%)`,
  );
  barColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-neutral-content")
    .trim();
  playlist: (keyof typeof musicList)[] = [
    "bad-apple-ft-sekai-off-vocal",
    "doodle",
    "bad-apple-ft-sekai",
    "discoupled",
  ];

  playing = false;
  startTime = 0;
  pauseTime = 0;
  lastBeat = -1;
  loop = true;
  debug = false;
  volume = 0.1;

  signal;

  constructor(init: VisualizerInit) {
    super(init);

    this.signal = {
      elapsedTime: signalToObj(createSignal(0)),
      duration: signalToObj(createSignal(musicList[this.music].duration)),
      musicInfo: signalToObj(createSignal(musicList[this.music])),
      volume: signalToObj(createSignal(this.volume)),
    };

    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 8192;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.gainNode = this.audioContext.createGain();

    this.canvas = document.createElement("canvas");
    if (this.debug) {
      this.canvas.width = 1000;
      this.canvas.height = 300;
    } else {
      this.canvas.width = 48;
      this.canvas.height = 32;
    }
    this.canvasContext = this.canvas.getContext("2d")!;
  }

  nextTract({ previous = false } = {}) {
    const index = this.playlist.indexOf(this.music);
    const nextIndex = previous
      ? (index - 1 + this.playlist.length) % this.playlist.length
      : (index + 1) % this.playlist.length;
    this.changeMusic(this.playlist[nextIndex]);
  }

  changeMusic(music: keyof typeof musicList) {
    this.stop({
      afterStop: () => {
        this.music = music;
        this.play();
      },
    });
  }

  seek(duration: number | undefined, percentage = 0) {
    // Clamp duration to track bounds
    const max = musicList[this.music].duration;
    duration = duration ?? (percentage / 100) * max;
    const target = Math.max(0, Math.min(duration, max));
    this.signal.elapsedTime.set(target);
    this.pauseTime = target;
    this.onSeek({ target });

    if (!this.source || !this.playing) return;

    this.stop({
      pause: true,
      fadeDuration: 0,
      isSeek: true,
      afterStop: () => {
        this.pauseTime = target;
        this.play({ resume: true, fadeDuration: 0, isSeek: true }); // resume from the new time
      },
    });
  }

  setVolume(volume: number) {
    // Clamp volume between 0 and 1
    this.volume = Math.max(0, Math.min(volume, 1));
    this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
  }

  getTime(): number {
    if (!this.playing) return this.pauseTime;
    return this.audioContext.currentTime - this.startTime;
  }

  getDuration(): number {
    return musicList[this.music].duration;
  }

  getMusic() {
    return musicList[this.music];
  }

  #playLock = false;
  play({
    resume = false,
    fadeDuration = undefined as undefined | number,
    isSeek = false,
  } = {}) {
    if (this.playing || this.#playLock) return;
    this.#playLock = true;
    this._play({ resume, fadeDuration, isSeek });
  }

  #elapsedIntervalId: number | null = null;
  async _play({
    resume,
    fadeDuration,
    isSeek,
  }: {
    resume: boolean;
    fadeDuration: undefined | number;
    isSeek: boolean;
  }) {
    try {
      const { src, bpm, startOffset, duration } = musicList[this.music];
      let audioBuffer = audioBufferCache.get(src);
      if (!audioBuffer) {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        audioBufferCache.set(src, audioBuffer);
      }

      this.source = this.audioContext.createBufferSource();
      this.source.buffer = audioBuffer;

      this.source.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(
        this.volume,
        this.audioContext.currentTime + (fadeDuration ?? this.fadeDuration),
      );

      const offset = resume ? this.pauseTime : startOffset;
      this.startTime = this.audioContext.currentTime - offset;
      this.source.start(0, offset);
      this.playing = true;
      this.signal.duration.set(musicList[this.music].duration);
      if (!isSeek) {
        this.signal.musicInfo.set(musicList[this.music]);
      }
      this.onStart({
        resume,
        bpm,
        duration,
        isSeek,
        music: musicList[this.music],
      });
      this.source.onended = () => {
        this.stop({ loop: this.loop });
      };

      this.signal.elapsedTime.set(this.getTime());
      this.#elapsedIntervalId = window.setInterval(() => {
        this.signal.elapsedTime.set(this.getTime());
      }, 1000);

      this.listen();
    } catch (e) {
      console.log("DEBUG[316]: e=", e);
    } finally {
      this.#playLock = false;
    }
  }

  #stopLock = false;
  stop({
    pause = false,
    loop = false,
    afterStop = () => {},
    fadeDuration = undefined as undefined | number,
    isSeek = false,
  } = {}) {
    if (this.#stopLock) return;
    this.#stopLock = true;
    const now = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(
      0,
      now + (fadeDuration ?? this.fadeDuration),
    );
    if (this.#elapsedIntervalId !== null) {
      clearInterval(this.#elapsedIntervalId);
      this.#elapsedIntervalId = null;
    }

    setTimeout(
      () => {
        if (this.source) {
          this.source.onended = null;
          this.source.stop();
          this.source.disconnect();
          this.source = null;
        }

        if (pause) {
          this.pauseTime = this.audioContext.currentTime - this.startTime;
        } else {
          this.pauseTime = 0;
          this.lastBeat = -1;
        }

        cancelAnimationFrame(this.#listenRafId);
        this.playing = false;
        this.onStop({ pause, isSeek });
        this.#stopLock = false;
        if (loop) {
          this.play();
        } else {
          afterStop();
        }
      },
      (fadeDuration ?? this.fadeDuration) * 1000,
    );
  }

  #listenRafId: number = 0;
  private listen = () => {
    const { bpm, firstBeatOffset, lowFreqStart, lowFreqEnd } =
      musicList[this.music];
    const { width, height } = this.canvas;
    const lowFreqWidth = lowFreqEnd - lowFreqStart;
    const currentTime = this.audioContext.currentTime - this.startTime;

    const beat = Math.floor((currentTime - firstBeatOffset) * (bpm / 60));

    if (currentTime > firstBeatOffset && beat !== this.lastBeat) {
      this.lastBeat = beat;
      this.onBeat();
    }

    this.analyser.getByteFrequencyData(this.freqData);
    this.canvasContext.clearRect(0, 0, width, height);

    let energy = 0;
    for (let i = lowFreqStart; i < lowFreqEnd; i++) {
      energy += this.freqData[i];
    }
    energy = energy / lowFreqWidth / 255;
    this.onEnergyUpdate(energy);

    if (this.debug) {
      const barWidth = width / lowFreqWidth;
      for (let i = lowFreqStart; i < lowFreqEnd; i++) {
        const value = this.freqData[i];
        const barHeight = (value / 255) * height;
        const x = (i - lowFreqStart) * barWidth;
        this.canvasContext.fillStyle = this.colors[i];
        this.canvasContext.fillRect(
          x,
          height - barHeight,
          barWidth - 2,
          barHeight,
        );
      }
    } else {
      const lowFreqStart = 100;
      const lowFreqEnd = 108;
      const lowFreqWidth = lowFreqEnd - lowFreqStart;
      const barWidth = width / lowFreqWidth;
      this.canvasContext.fillStyle = this.barColor;

      for (let i = lowFreqStart; i < lowFreqEnd; i++) {
        const value = this.freqData[i];
        const barHeight = (value / 255) * height;
        const x = (i - lowFreqStart) * barWidth;
        this.canvasContext.fillRect(
          x,
          height - barHeight,
          barWidth - 0.5,
          barHeight,
        );
      }
    }

    this.#listenRafId = requestAnimationFrame(this.listen);
  };
}
