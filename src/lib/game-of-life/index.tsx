import type { SolidNode } from "@tanstack/solid-router";

export class GameOfLife {
  width: number;
  cellSize: number;
  height: number;
  grid: Uint8Array<ArrayBuffer>;
  nextGrid: Uint8Array<ArrayBuffer>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor({ width, height }: { width: number; height: number }) {
    this.width = width;
    this.height = height;
    this.grid = new Uint8Array(width * height);
    this.nextGrid = new Uint8Array(width * height);
    this.randomize();

    // Prepare canvas once
    this.cellSize = 10;
    this.canvas = document.createElement("canvas");
    this.canvas.width = width * this.cellSize;
    this.canvas.height = height * this.cellSize;
    this.ctx = this.canvas.getContext("2d")!;

    this.updateCanvas();
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

  getCode(): SolidNode {
    const lines: SolidNode[] = [];
    for (let y = 0; y < this.height; y++) {
      let line = "";
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x;
        line += this.grid[index] === 1 ? "⬛" : "⬜";
      }
      lines.push(<code>{line}</code>);
    }
    return <div class="flex flex-col leading-5">{lines}</div>;
  }

  updateCanvas(): HTMLCanvasElement {
    const { ctx, cellSize, width, height } = this;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width * cellSize, height * cellSize);

    ctx.fillStyle = "#000000";

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const i = rowOffset + x;
        if (this.grid[i]) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    return this.canvas;
  }

  drawDiff(): void {
    const { width, height, cellSize, ctx, grid, nextGrid } = this;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const i = rowOffset + x;
        if (grid[i] !== nextGrid[i]) {
          ctx.fillStyle = grid[i] === 1 ? "#000000" : "#ffffff";
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
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

    this.drawDiff();
    // this.updateCanvas();
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
