const musicList = {
  doodle: {
    src: "/music/doodle.mp3",
    bpm: 160,
    firstBeatOffest: 0.5,
  },
};

export class Visualizer {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  source: AudioBufferSourceNode | null = null;
  freqData: Uint8Array;
  gainNode: GainNode;
  lowFreqBins = 64;

  playing = false;
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
  src: string;
  bpm: number;
  firstBeatOffest: number;
  loop = true;

  constructor({
    onEnergyUpdate,
    onBeat,
    music,
  }: {
    onEnergyUpdate: (energy: number) => void;
    onBeat: () => void;
    music: keyof typeof musicList;
  }) {
    this.onEnergyUpdate = onEnergyUpdate;
    this.onBeat = onBeat;
    this.src = musicList[music].src;
    this.bpm = musicList[music].bpm;
    this.firstBeatOffest = musicList[music].firstBeatOffest;

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

  async play() {
    if (this.playing) {
      this.loop = false;
      this.stop();
      return;
    }
    this.loop = true;

    const response = await fetch(this.src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = audioBuffer;

    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.1;

    this.source.start();
    this.playing = true;
    this.source.onended = () => {
      this.stop();
      if (this.loop) this.play();
    };

    this.listen();
  }

  stop() {
    if (this.source) {
      this.source.stop();
      this.source.disconnect();
      this.source = null;
    }

    this.lastBeat = -1;
    this.playing = false;
    cancelAnimationFrame(this.rafId);
  }

  private listen = () => {
    const { lowFreqBins, bpm, firstBeatOffest } = this;
    const { width, height } = this.canvas;
    const currentTime = this.audioContext.currentTime;

    const beat = Math.floor((currentTime - firstBeatOffest) * (bpm / 60));

    if (currentTime > firstBeatOffest && beat !== this.lastBeat) {
      this.lastBeat = beat;
      this.onBeat();
    }

    this.analyser.getByteFrequencyData(this.freqData);
    this.canvasContext.clearRect(0, 0, width, height);

    let energy = 0;
    for (let i = 0; i < lowFreqBins; i++) {
      energy += this.freqData[i];
    }
    energy = energy / lowFreqBins / 255;
    this.onEnergyUpdate(energy);

    const barWidth = width / lowFreqBins;
    for (let i = 0; i < lowFreqBins; i++) {
      const value = this.freqData[i];
      const barHeight = (value / 255) * height;

      const x = i * barWidth;

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
