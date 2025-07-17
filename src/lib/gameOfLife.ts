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
  offsetX = 0;
  offsetY = 0;

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
    this.pulseDuration = 300;
    this.pulseSize = 0.25;

    this.grid = new Uint8Array(width * height);
    this.nextGrid = new Uint8Array(width * height);
    this.randomize();

    // Prepare canvas once
    this.canvas = document.createElement("canvas");
    this.canvas.width = width * this.cellSize;
    this.canvas.height = height * this.cellSize;
    this.ctx = this.canvas.getContext("2d")!;

    this.next();
    this.updateCanvas();
  }

  randomize() {
    this.grid = this.grid.map(() => (Math.random() > 0.8 ? 1 : 0));
  }

  #movingId: ReturnType<typeof setInterval> | null = null;
  startMoving() {
    if (this.#movingId) {
      clearInterval(this.#movingId);
      this.#movingId = null;
      return;
    }
    this.#movingId = setInterval(() => {
      this.moveCircle();
    }, 10);
  }

  #tickTime = 0;
  moveCircle() {
    this.#tickTime += 0.001; // Controls speed of the circular motion

    const radius = this.canvas.width; // Adjust this based on how big the scroll radius should be
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.offsetX = wrap(
      centerX + radius * Math.cos(this.#tickTime),
      this.canvas.width,
    );
    this.offsetY = wrap(
      centerY + radius * Math.sin(this.#tickTime),
      this.canvas.height,
    );
  }

  moveDiagonal() {
    this.offsetX = (this.offsetX + 1) % this.canvas.width;
    this.offsetY = (this.offsetY + 1) % this.canvas.height;
  }

  updateCanvas(pulse = false, energy = 0): HTMLCanvasElement {
    const {
      ctx,
      cellSize,
      width,
      height,
      pulseDuration,
      pulseStart,
      pulseSize,
      offsetX,
      offsetY,
    } = this;

    const easeScale = pulse
      ? 1 +
        easeOutQuartMirror(
          Math.min((performance.now() - pulseStart) / pulseDuration, 1),
        ) *
          pulseSize
      : 1;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = "#000000";
    const baseRadius = (cellSize * (0.8 + energy / 1.75) - 1) / 2;
    const radius = baseRadius * easeScale;

    const twoPi = Math.PI * 2;

    const pixelOffsetX = offsetX % cellSize;
    const pixelOffsetY = offsetY % cellSize;

    const cellOffsetX = Math.floor(offsetX / cellSize);
    const cellOffsetY = Math.floor(offsetY / cellSize);

    for (let y = 0; y < height; y++) {
      const gy = (cellOffsetY + y) % height;
      const cy = y * cellSize - pixelOffsetY + cellSize / 2;

      for (let x = 0; x < width; x++) {
        const gx = (cellOffsetX + x) % width;
        const cx = x * cellSize - pixelOffsetX + cellSize / 2;
        const i = gy * width + gx;

        if (this.grid[i]) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, twoPi);
          ctx.fill();
        }
      }
    }

    return this.canvas;
  }

  startPulseRender() {
    const render = () => {
      this.updateCanvas(true);
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

  /* eslint-disable prefer-const */
  #density = 1;
  next() {
    this.nextGrid.fill(0);
    let aliveCount = 0;

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
          aliveCount++;
          this.nextGrid[i] = liveNeighbors === 2 || liveNeighbors === 3 ? 1 : 0;
        } else {
          this.nextGrid[i] =
            liveNeighbors === 3 ||
            (this.#density < 0.1 ? liveNeighbors === 4 : false)
              ? 1
              : 0;
        }
      }
    }

    this.#density = aliveCount / this.grid.length;

    [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
  }
  /* eslint-enable prefer-const */

  resize(width: number, height: number, cellSize: number) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;

    this.canvas.width = width * cellSize;
    this.canvas.height = height * cellSize;

    this.grid = new Uint8Array(width * height);
    this.nextGrid = new Uint8Array(width * height);
    this.randomize();
    this.next();

    this.updateCanvas();
  }

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

function easeOutQuartMirror(x: number): number {
  if (x < 0.5) {
    return Math.pow(2 * x, 4); // mirrored rise
  } else {
    return Math.pow(2 * (1 - x), 4); // mirrored fall
  }
}

function wrap(value: number, max: number): number {
  return ((value % max) + max) % max;
}
