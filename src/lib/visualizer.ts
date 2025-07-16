export class Visualizer {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  source: AudioBufferSourceNode | undefined;
  freqData: Uint8Array;
  gainNode: GainNode;

  playing = false;
  bpm: number;
  firstBeatOffest: number; // in seconds
  lastBeat = -1;

  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;

  onEnergyUpdate: (energy: number) => void;
  onBeat: () => void;

  constructor({
    onEnergyUpdate,
    onBeat,
    bpm,
    firstBeatOffest,
  }: {
    onEnergyUpdate: (energy: number) => void;
    onBeat: () => void;
    bpm: number;
    firstBeatOffest: number;
  }) {
    this.bpm = bpm;
    this.onEnergyUpdate = onEnergyUpdate;
    this.onBeat = onBeat;
    this.firstBeatOffest = firstBeatOffest;

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

  async loadAndPlay(fileUrl: string) {
    if (this.playing) {
      this.source?.stop();
      this.playing = false;
      return;
    }
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = audioBuffer;
    this.source.loop = true;

    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.1;

    this.source.start();
    this.playing = true;
    this.listen();
  }

  private listen = () => {
    const beat = Math.floor(
      (this.audioContext.currentTime - this.firstBeatOffest) * (this.bpm / 60),
    );

    if (
      this.audioContext.currentTime > this.firstBeatOffest &&
      beat !== this.lastBeat
    ) {
      this.lastBeat = beat;
      this.onBeat();
    }

    this.analyser.getByteFrequencyData(this.freqData);
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const lowFreqBins = 64;
    let energy = 0;
    for (let i = 0; i < lowFreqBins; i++) {
      energy += this.freqData[i];
    }
    energy = energy / lowFreqBins / 255;
    this.onEnergyUpdate(energy);

    for (let i = 0; i < lowFreqBins; i++) {
      const value = this.freqData[i];
      const barHeight = (value / 255) * this.canvas.height;

      const barWidth = this.canvas.width / lowFreqBins;
      const x = i * barWidth;

      this.canvasContext.fillStyle = `hsl(${(i / lowFreqBins) * 360}, 100%, 50%)`;
      this.canvasContext.fillRect(
        x,
        this.canvas.height - barHeight,
        barWidth - 2,
        barHeight,
      );
    }

    requestAnimationFrame(this.listen);
  };
}
