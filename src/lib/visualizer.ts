import { clamp } from "es-toolkit";

import { createObjSignal } from "./utils";
import { musicList } from "./vars";

const DEBUG = false;
const DEFAULT_FADE_DURATION = 500;
const LOW_FREQ_BINS = 64;
const LOW_FREQ_START = 100;
const LOW_FREQ_END = 108;
const MIN_BAR_HEIGHT = 2;

export class Visualizer {
  static audioBufferCache = new Map<string, AudioBuffer>();
  audioContext: AudioContext;
  analyser: AnalyserNode;
  source: AudioBufferSourceNode | null = null;
  freqData: Uint8Array<ArrayBuffer>;
  gainNode: GainNode;
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  colors = Array.from(
    { length: LOW_FREQ_BINS },
    (_, i) => `hsl(${(i / LOW_FREQ_BINS) * 360}, 100%, 50%)`,
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

  onEnergyUpdate;
  onBeat;
  onStart;
  onStop;
  onSeek;
  onMusicEnd;
  music;
  volume;

  signal;

  constructor(init: {
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
    onMusicEnd: () => void;
    music: keyof typeof musicList;
    volume?: number;
  }) {
    this.onEnergyUpdate = init.onEnergyUpdate;
    this.onBeat = init.onBeat;
    this.onStart = init.onStart;
    this.onStop = init.onStop;
    this.onSeek = init.onSeek;
    this.music = init.music;
    this.volume = init.volume ?? 0.1;
    this.onMusicEnd = init.onMusicEnd;

    this.signal = {
      elapsedTime: createObjSignal(0),
      duration: createObjSignal(musicList[this.music].duration),
      musicInfo: createObjSignal(musicList[this.music]),
      volume: createObjSignal(this.volume),
    };

    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 8192;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.gainNode = this.audioContext.createGain();

    this.canvas = document.createElement("canvas");
    this.canvas.width = 48;
    this.canvas.height = 32;
    const canvasContext = this.canvas.getContext("2d");
    if (!canvasContext) throw new Error("Canvas context is not available");
    this.canvasContext = canvasContext;

    this.prefetchAudioBuffer(musicList[this.music].src);
  }

  skip(direction: 1 | -1 = 1) {
    const index = this.playlist.indexOf(this.music);
    const nextIndex =
      direction === -1
        ? (index - 1 + this.playlist.length) % this.playlist.length
        : (index + 1) % this.playlist.length;
    this.switch(this.playlist[nextIndex]);
  }

  switch(music: keyof typeof musicList) {
    this.stop({
      onStop: () => {
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
      onStop: () => {
        this.pauseTime = target;
        this.play({ resume: true, fadeDuration: 0, isSeek: true }); // resume from the new time
      },
    });
  }

  setVolume(volume: number) {
    this.volume = clamp(volume, 0, 1);
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

  prefetchAudioBuffer(src: string) {
    const prefetch = async () => {
      if (Visualizer.audioBufferCache.has(src)) return;
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      Visualizer.audioBufferCache.set(src, audioBuffer);
    };
    prefetch().catch((e) => {
      console.error(e);
    });
  }

  #elapsedIntervalId: number | null = null;
  #playLock = false;
  play({ resume = false, fadeDuration = undefined as undefined | number, isSeek = false } = {}) {
    if (this.playing || this.#playLock) return;
    this.#playLock = true;
    this.#play({ resume, fadeDuration, isSeek }).catch((e) => {
      console.error(e);
    });
  }

  async #play({
    resume,
    fadeDuration = DEFAULT_FADE_DURATION,
    isSeek,
  }: {
    resume: boolean;
    fadeDuration: undefined | number;
    isSeek: boolean;
  }) {
    try {
      const { src, bpm, startOffset, duration } = musicList[this.music];
      let audioBuffer = Visualizer.audioBufferCache.get(src);
      if (!audioBuffer) {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        Visualizer.audioBufferCache.set(src, audioBuffer);
      }

      this.source = this.audioContext.createBufferSource();
      this.source.buffer = audioBuffer;

      this.source.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(
        this.volume,
        this.audioContext.currentTime + fadeDuration / 1000,
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
        this.onMusicEnd();
      };

      this.signal.elapsedTime.set(this.getTime());
      this.#elapsedIntervalId = window.setInterval(() => {
        this.signal.elapsedTime.set(this.getTime());
      }, 1000);

      this.listen();
    } catch (e) {
      console.error(e);
    } finally {
      this.#playLock = false;

      const index = this.playlist.indexOf(this.music);
      const nextIndex = (index + 1) % this.playlist.length;
      const prevIndex = (index - 1 + this.playlist.length) % this.playlist.length;

      this.prefetchAudioBuffer(musicList[this.playlist[nextIndex]].src);
      this.prefetchAudioBuffer(musicList[this.playlist[prevIndex]].src);
    }
  }

  #stopLock = false;
  stop({
    pause = false,
    loop = false,
    onStop = () => {},
    fadeDuration = DEFAULT_FADE_DURATION,
    isSeek = false,
  } = {}) {
    if (this.#stopLock) return;
    this.#stopLock = true;
    const now = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + fadeDuration / 1000);
    if (this.#elapsedIntervalId !== null) {
      clearInterval(this.#elapsedIntervalId);
      this.#elapsedIntervalId = null;
    }

    setTimeout(() => {
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
        onStop();
      }
    }, fadeDuration);
  }

  #listenRafId: number = 0;
  #renderRafId: number = 0;
  private listen = () => {
    const { bpm, firstBeatOffset, lowFreqStart, lowFreqEnd } = musicList[this.music];
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

    if (DEBUG) {
      const barWidth = width / lowFreqWidth;
      for (let i = lowFreqStart; i < lowFreqEnd; i++) {
        const value = this.freqData[i];
        const barHeight = (value / 255) * height;
        const x = (i - lowFreqStart) * barWidth;
        this.canvasContext.fillStyle = this.colors[i];
        this.canvasContext.fillRect(x, height - barHeight, barWidth - 2, barHeight);
      }
    } else {
      const lowFreqWidth = LOW_FREQ_END - LOW_FREQ_START;
      const barWidth = width / lowFreqWidth;
      this.canvasContext.fillStyle = this.barColor;

      for (let i = LOW_FREQ_START; i < LOW_FREQ_END; i++) {
        const value = this.freqData[i];
        const barHeight = clamp((value / 255) * height, MIN_BAR_HEIGHT, height);
        const x = (i - LOW_FREQ_START) * barWidth;
        this.canvasContext.fillRect(x, height - barHeight, barWidth - 0.5, barHeight);
      }
    }

    this.#listenRafId = requestAnimationFrame(this.listen);
  };

  private renderIdle = () => {
    const { width, height } = this.canvas;
    const lowFreqWidth = LOW_FREQ_END - LOW_FREQ_START;
    const barWidth = width / lowFreqWidth;

    this.canvasContext.clearRect(0, 0, width, height);
    this.canvasContext.fillStyle = this.barColor;

    for (let i = LOW_FREQ_START; i < LOW_FREQ_END; i++) {
      const x = (i - LOW_FREQ_START) * barWidth;
      this.canvasContext.fillRect(x, height - MIN_BAR_HEIGHT, barWidth - 0.5, MIN_BAR_HEIGHT);
    }

    this.#renderRafId = requestAnimationFrame(this.renderIdle);
  };

  startIdleRender() {
    if (this.#renderRafId === 0) {
      this.renderIdle();
    }
  }

  stopIdleRender() {
    if (this.#renderRafId !== 0) {
      cancelAnimationFrame(this.#renderRafId);
      this.#renderRafId = 0;
      const { width, height } = this.canvas;
      this.canvasContext.clearRect(0, 0, width, height);
    }
  }
}
