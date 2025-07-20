const musicList = {
  doodle: {
    src: "/music/doodle.webm",
    bpm: 160,
    startOffset: 0,
    firstBeatOffset: 0.5,
    lowFreqStart: 0,
    lowFreqEnd: 64,
    duration: 74,
  },
  discoupled: {
    src: "/music/discopled.webm",
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
    startOffset: 0,
    firstBeatOffset: 1,
    lowFreqStart: 0,
    lowFreqEnd: 64,
    duration: 229,
  },
  "bad-apple-ft-sekai": {
    src: "/music/bad-apple-ft-sekai.webm",
    bpm: 138,
    startOffset: 1,
    firstBeatOffset: 1,
    lowFreqStart: 16,
    lowFreqEnd: 18,
    duration: 231,
  },
};

const audioBufferCache = new Map<string, AudioBuffer>();

export class Visualizer {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  source: AudioBufferSourceNode | null = null;
  freqData: Uint8Array;
  gainNode: GainNode;
  lowFreqBins = 64;
  fadeDuration = 0.5;

  playing = false;
  startTime = 0;
  pauseTime = 0;
  lastBeat = -1;

  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  rafId: number = 0;
  colors = Array.from(
    { length: this.lowFreqBins },
    (_, i) => `hsl(${(i / this.lowFreqBins) * 360}, 100%, 50%)`,
  );

  onEnergyUpdate: (energy: number) => void;
  onBeat: () => void;
  onStart: ({
    resume,
    bpm,
  }: {
    resume: boolean;
    bpm: number;
    duration: number;
  }) => void;
  onStop: ({ pause, isSeek }: { pause: boolean; isSeek: boolean }) => void;
  onElapsedTimeUpdate: (duration: number) => void;
  music: keyof typeof musicList;
  playlist: (keyof typeof musicList)[] = [
    "bad-apple-ft-sekai-off-vocal",
    "doodle",
    "bad-apple-ft-sekai",
    "discoupled",
  ];
  loop = true;

  constructor({
    onEnergyUpdate,
    onBeat,
    onStart,
    onStop,
    onElapsedTimeUpdate,
    music,
  }: {
    onEnergyUpdate: (energy: number) => void;
    onBeat: () => void;
    onStart: ({
      resume,
      bpm,
    }: {
      resume: boolean;
      bpm: number;
      duration: number;
    }) => void;
    onStop: ({ pause, isSeek }: { pause: boolean; isSeek: boolean }) => void;
    onElapsedTimeUpdate: (duration: number) => void;
    music: keyof typeof musicList;
  }) {
    this.onEnergyUpdate = onEnergyUpdate;
    this.onBeat = onBeat;
    this.onStart = onStart;
    this.onStop = onStop;
    this.onElapsedTimeUpdate = onElapsedTimeUpdate;

    this.music = music;

    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 8192;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.gainNode = this.audioContext.createGain();

    this.canvas = document.createElement("canvas");
    this.canvas.width = 1000;
    this.canvas.height = 300;
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
    this.onElapsedTimeUpdate(target);
    this.pauseTime = target;

    if (!this.source || !this.playing) return;

    this.stop({
      pause: true,
      fadeDuration: 0,
      isSeek: true,
      afterStop: () => {
        this.pauseTime = target;
        this.play({ resume: true, fadeDuration: 0 }); // resume from the new time
      },
    });
  }

  getTime(): number {
    if (!this.playing) return this.pauseTime;
    return this.audioContext.currentTime - this.startTime;
  }

  getDuration(): number {
    return musicList[this.music].duration;
  }

  #playLock = false;
  play({
    resume = false,
    fadeDuration = undefined as undefined | number,
  } = {}) {
    if (this.playing || this.#playLock) return;
    this.#playLock = true;
    this._play({ resume, fadeDuration });
  }

  #elapsedIntervalId: number | null = null;
  async _play({
    resume,
    fadeDuration,
  }: {
    resume: boolean;
    fadeDuration: undefined | number;
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
        0.1,
        this.audioContext.currentTime + (fadeDuration ?? this.fadeDuration),
      );

      const offset = resume ? this.pauseTime : startOffset;
      this.startTime = this.audioContext.currentTime - offset;
      this.source.start(0, offset);
      this.playing = true;
      this.onStart({ resume, bpm, duration });
      this.source.onended = () => {
        this.stop({ loop: this.loop });
      };

      this.#elapsedIntervalId = window.setInterval(() => {
        this.onElapsedTimeUpdate(this.getTime());
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

        cancelAnimationFrame(this.rafId);
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

    this.rafId = requestAnimationFrame(this.listen);
  };
}
