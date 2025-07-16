export class GameOfLife {
  width: number;
  cellSize: number;
  height: number;
  pulseStart: number;
  pulseDuration: number;
  pulseSize: number;
  grid: Uint8Array<ArrayBuffer>;
  nextGrid: Uint8Array<ArrayBuffer>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor({
    width,
    height,
    cellSize,
  }: {
    width: number;
    height: number;
    cellSize: number;
  }) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;

    this.pulseStart = 0;
    this.pulseDuration = 400;
    this.pulseSize = 0.15;

    this.grid = new Uint8Array(width * height);
    this.nextGrid = new Uint8Array(width * height);
    this.randomize();

    // Prepare canvas once
    this.canvas = document.createElement("canvas");
    this.canvas.width = width * this.cellSize;
    this.canvas.height = height * this.cellSize;
    this.ctx = this.canvas.getContext("2d")!;

    this.next();
    this.updateCanvas({ pulse: false });
  }

  randomize() {
    this.grid = this.grid.map(() => (Math.random() > 0.8 ? 1 : 0));
  }

  getCell(x: number, y: number): number {
    return this.grid[y * this.width + x];
  }

  setCell(x: number, y: number, value: number): void {
    this.grid[y * this.width + x] = value;
  }

  updateCanvas({
    pulse = false,
    energy = 0,
  }: {
    pulse?: boolean;
    energy?: number;
  } = {}): HTMLCanvasElement {
    const {
      ctx,
      cellSize,
      width,
      height,
      pulseDuration,
      pulseStart,
      pulseSize,
    } = this;

    const now = performance.now();
    const elapsed = now - pulseStart;
    const t = Math.min(elapsed / pulseDuration, 1);
    const easeScale = 1 + easeOutExpo(t) * pulseSize;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width * cellSize, height * cellSize);

    ctx.fillStyle = "#000000";
    const baseRadius = (cellSize * (0.8 + energy / 2) - 1) / 2;
    const radius = pulse ? baseRadius * easeScale * 0.8 : baseRadius;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const i = rowOffset + x;
        if (this.grid[i]) {
          const cx = x * cellSize + cellSize / 2;
          const cy = y * cellSize + cellSize / 2;

          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    return this.canvas;
  }

  startPulseRender() {
    const render = () => {
      this.updateCanvas({ pulse: true });
      if (performance.now() - this.pulseStart < this.pulseDuration) {
        requestAnimationFrame(render);
      }
    };

    requestAnimationFrame(render);
  }

  pulse() {
    this.pulseStart = performance.now();
    this.startPulseRender();
  }

  run(delay: number) {
    setInterval(() => {
      this.next();
      this.updateCanvas();
    }, delay);
  }

  /* eslint-disable prefer-const */
  next() {
    this.nextGrid.fill(0);

    for (let y = 0; y < this.height; y++) {
      let rowOffset = y * this.width,
        topRow = (y - 1) * this.width,
        midRow = y * this.width,
        bottomRow = (y + 1) * this.width;
      for (let x = 0; x < this.width; x++) {
        let i = rowOffset + x,
          liveNeighbors = 0;

        if (y > 0) {
          if (x > 0) liveNeighbors += this.grid[topRow + x - 1];
          liveNeighbors += this.grid[topRow + x];
          if (x + 1 < this.width) liveNeighbors += this.grid[topRow + x + 1];
        }
        if (x > 0) liveNeighbors += this.grid[midRow + x - 1];
        if (x + 1 < this.width) liveNeighbors += this.grid[midRow + x + 1];
        if (y + 1 < this.height) {
          if (x > 0) liveNeighbors += this.grid[bottomRow + x - 1];
          liveNeighbors += this.grid[bottomRow + x];
          if (x + 1 < this.width) liveNeighbors += this.grid[bottomRow + x + 1];
        }

        if (this.grid[i] === 1) {
          this.nextGrid[i] = liveNeighbors === 2 || liveNeighbors === 3 ? 1 : 0;
        } else {
          this.nextGrid[i] = liveNeighbors === 3 ? 1 : 0;
        }
      }
    }

    [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
  }
  /* eslint-enable prefer-const */

  benchmark(iterations = 1000) {
    console.log("benchmarking");

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.next();
    }
    const end = performance.now();
    const durationInSeconds = (end - start) / 1000;
    const generationsPerSecond = iterations / durationInSeconds;

    console.log(`Generations per second: ${generationsPerSecond}`);
  }

  benchmarkCanvasRender(iterations: number = 100) {
    console.log("benchmarking canvas render");
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      this.updateCanvas();
    }

    const end = performance.now();
    const durationInSeconds = (end - start) / 1000;
    const drawingsPerSecond = iterations / durationInSeconds;

    console.log(`Drawings per second: ${drawingsPerSecond}`);
  }
}

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}
