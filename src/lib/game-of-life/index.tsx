import type { SolidNode } from "@tanstack/solid-router";

export class GameOfLife {
  width: number;
  height: number;
  grid: Uint8Array<ArrayBuffer>;

  constructor({ width, height }: { width: number; height: number }) {
    this.width = width;
    this.height = height;
    this.grid = new Uint8Array(width * height);
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

  next() {
    const newGrid = new Uint8Array(this.width * this.height);

    const get = (x: number, y: number): number => {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 0;
      return this.grid[y * this.width + x];
    };

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = y * this.width + x;

        let liveNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            liveNeighbors += get(x + dx, y + dy);
          }
        }

        const isAlive = this.grid[i] === 1;
        if (isAlive) {
          newGrid[i] = liveNeighbors === 2 || liveNeighbors === 3 ? 1 : 0;
        } else {
          newGrid[i] = liveNeighbors === 3 ? 1 : 0;
        }
      }
    }

    this.grid = newGrid;
  }
}
