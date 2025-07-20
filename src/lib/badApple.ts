import type { GameOfLife } from "./gameOfLife";

const src = "/bad-apple-pixel-frame.bin.gz";
const binMetadata = {
  width: 128,
  height: 96,
  threshold: 127,
  frames: 6875,
  duration: 229.184,
  fps: 29.997731080703716,
  frame_byte_length: 1536,
  binary_size: 10560000,
};

export class BadApple {
  src: string;
  data: Uint8Array = new Uint8Array();
  width = binMetadata.width;
  height = binMetadata.height;
  bytesPerFrame = (this.width * this.height) / 8;
  frameCount = binMetadata.frames;
  frameIndex = 0;
  fps = binMetadata.fps;
  intervalId: ReturnType<typeof setInterval> | null = null;
  game: GameOfLife;

  constructor({ game }: { game: GameOfLife }) {
    this.src = src;
    this.game = game;
    this.load();
  }

  async load(): Promise<void> {
    const res = await fetch(this.src);
    this.data = new Uint8Array(await res.arrayBuffer());
  }

  getFrame(index: number): Uint8Array {
    const start = index * this.bytesPerFrame;
    return this.data.slice(start, start + this.bytesPerFrame);
  }

  unpackFrame(packed: Uint8Array): Uint8Array {
    const bits = new Uint8Array(this.width * this.height);
    for (let i = 0; i < bits.length; i++) {
      const byte = packed[i >> 3];
      bits[i] = (byte >> (7 - (i % 8))) & 1;
    }
    return bits;
  }

  injectFrameIntoGame(_frameIndex?: number) {
    if (!this.data.length) {
      this.load();
      return;
    }
    const frameIndex = _frameIndex ?? this.frameIndex;
    const _game = this.game;
    const packed = this.getFrame(frameIndex % this.frameCount);
    const unpacked = this.unpackFrame(packed);

    const targetWidth = _game.width;
    const targetHeight = _game.height;

    const srcAspect = this.width / this.height;
    const targetAspect = targetWidth / targetHeight;

    let scaledWidth = targetWidth;
    let scaledHeight = targetHeight;

    if (targetAspect > srcAspect) {
      scaledWidth = Math.floor(targetHeight * srcAspect);
    } else {
      scaledHeight = Math.floor(targetWidth / srcAspect);
    }

    const offsetX = Math.floor((targetWidth - scaledWidth) / 2);
    const offsetY = Math.floor((targetHeight - scaledHeight) / 2);

    _game.injectionMask.fill(0);
    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const srcX = Math.floor((x / scaledWidth) * this.width);
        const srcY = Math.floor((y / scaledHeight) * this.height);
        const dstX = x + offsetX;
        const dstY = y + offsetY;

        const i = dstY * _game.width + dstX;
        _game.grid[i] = unpacked[srcY * this.width + srcX];
        _game.injectionMask[i] = 1;
      }
    }
  }

  onSeek({ target }: { target: number }) {
    const newFrameIndex = Math.floor(target * this.fps);
    this.frameIndex = Math.max(0, Math.min(this.frameCount - 1, newFrameIndex));
  }

  play() {
    if (!this.data.length) return;
    this.intervalId = setInterval(() => {
      this.frameIndex++;
      if (this.frameIndex >= this.frameCount) {
        this.stop();
        return;
      }
      this.injectFrameIntoGame();
    }, 1000 / this.fps);
  }

  stop(pause = false): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (!pause) {
      this.frameIndex = 0;
    }
  }
}
