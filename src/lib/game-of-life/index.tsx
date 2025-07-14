import type { SolidNode } from "@tanstack/solid-router";

export class GameOfLife {
  width: number;
  height: number;
  grid: Uint8Array<ArrayBuffer>;
  nextGrid: Uint8Array<ArrayBuffer>;

  constructor({ width, height }: { width: number; height: number }) {
    this.width = width;
    this.height = height;
    this.grid = new Uint8Array(width * height);
    this.nextGrid = new Uint8Array(width * height);
  }

  randomize() {
    this.grid = this.grid.map(() => (Math.random() > 0.5 ? 1 : 0));
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

    [this.nextGrid, this.grid] = [this.grid, this.nextGrid];
  }
  /* eslint-enable prefer-const */

  benchmark(iterations = 1000) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.next();
    }
    const end = performance.now();
    const durationInSeconds = (end - start) / 1000;
    const generationsPerSecond = iterations / durationInSeconds;
    return {
      generationsPerSecond,
    };
  }
}
