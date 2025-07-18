import type { GameOfLife } from "./gameOfLife";

export class BadApple {
  src: string;
  data: Uint8Array = new Uint8Array();
  width = 128;
  height = 96;
  bytesPerFrame = (this.width * this.height) / 8;
  frameCount = 0;
  frameIndex = 0;
  intervalId: ReturnType<typeof setInterval> | null = null;
  game: GameOfLife;

  constructor({ src, game }: { src: string; game: GameOfLife }) {
    this.src = src;
    this.game = game;
  }

  async load(): Promise<void> {
    const res = await fetch(this.src);
    this.data = new Uint8Array(await res.arrayBuffer());
    this.frameCount = Math.floor(this.data.length / this.bytesPerFrame);
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

  injectFrameIntoGame(game: GameOfLife, frameIndex: number) {
    if (!this.data.length) {
      this.load();
      return;
    }
    const packed = this.getFrame(frameIndex % this.frameCount);
    const unpacked = this.unpackFrame(packed);

    const targetWidth = game.width;
    const targetHeight = game.height;
    const scaled = new Uint8Array(targetWidth * targetHeight);

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

    for (let y = 0; y < scaledHeight; y++) {
      for (let x = 0; x < scaledWidth; x++) {
        const srcX = Math.floor((x / scaledWidth) * this.width);
        const srcY = Math.floor((y / scaledHeight) * this.height);
        const dstX = x + offsetX;
        const dstY = y + offsetY;
        scaled[dstY * targetWidth + dstX] = unpacked[srcY * this.width + srcX];
      }
    }

    game.grid.set(scaled);
    game.updateCanvas();
  }

  async play(fps: number = 30): Promise<void> {
    if (!this.data.length) await this.load();
    this.stop();
    this.intervalId = setInterval(() => {
      this.injectFrameIntoGame(this.game, this.frameIndex++);
    }, 1000 / fps);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
