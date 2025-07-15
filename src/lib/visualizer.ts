export class Visualizer {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  source: AudioBufferSourceNode | undefined;
  freqData: Uint8Array;
  gainNode: GainNode;
  playing = false;
  bpm: number;

  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;

  onEnergyUpdate: (energy: number) => void;

  constructor({
    onEnergyUpdate,
    bpm,
  }: {
    onEnergyUpdate: (energy: number) => void;
    bpm: number;
  }) {
    this.bpm = bpm;
    this.onEnergyUpdate = onEnergyUpdate;
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
    const { width, height } = this.canvas;

    this.analyser.getByteFrequencyData(this.freqData);
    this.canvasContext.clearRect(0, 0, width, height);

    const lowFreqBins = 64;
    let energy = 0;
    for (let i = 0; i < lowFreqBins; i++) {
      energy += this.freqData[i];
    }
    energy = energy / lowFreqBins / 255;
    this.onEnergyUpdate(energy);

    for (let i = 0; i < lowFreqBins; i++) {
      const value = this.freqData[i];
      const barHeight = (value / 255) * height;

      const barWidth = width / lowFreqBins;
      const x = i * barWidth;

      this.canvasContext.fillStyle = `hsl(${(i / lowFreqBins) * 360}, 100%, 50%)`;
      this.canvasContext.fillRect(
        x,
        height - barHeight,
        barWidth - 2,
        barHeight,
      );
    }

    requestAnimationFrame(this.listen);
  };
}
