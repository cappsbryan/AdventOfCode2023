import * as fs from "fs/promises";
import { time } from "./timer";

type Mirror = "/" | "\\";
type Splitter = "|" | "-";
type Tile = "." | Mirror | Splitter;
type Direction = "N" | "E" | "S" | "W";
type Position = { row: number; col: number };

const allDirections = ["N", "E", "S", "W"] as const;

class Grid {
  #grid: Tile[][];
  #height: number;
  #width: number;
  #history: { [k in Direction]: boolean[][] };

  constructor(input: string) {
    const lines = input.split("\n");
    this.#height = lines.length;
    this.#width = lines[0].length;

    this.#grid = Array(this.#height)
      .fill(0)
      .map(() => Array(this.#width));

    this.#history = Grid.emptyHistory(this.#height, this.#width);

    for (let row = 0; row < this.#height; row++) {
      for (let col = 0; col < this.#width; col++) {
        this.#grid[row][col] = lines[row][col] as Tile;
      }
    }
  }

  reset(): void {
    this.#history = Grid.emptyHistory(this.#height, this.#width);
  }

  static emptyHistory(height: number, width: number) {
    return Object.fromEntries(
      allDirections.map((direction) => [
        direction,
        Array(height)
          .fill(0)
          .map(() => Array<boolean>(width).fill(false)),
      ])
    ) as { [k in Direction]: boolean[][] };
  }

  get(position: Position): Tile | undefined {
    if (
      position.row < 0 ||
      position.row >= this.#height ||
      position.col < 0 ||
      position.col >= this.#width
    ) {
      return undefined;
    }
    return this.#grid[position.row][position.col];
  }

  energize(beam: Beam) {
    const { position, heading } = beam;
    this.#history[heading][position.row][position.col] = true;
  }

  energizedCount(): number {
    let sum = 0;
    for (let row = 0; row < this.#height; row++) {
      for (let col = 0; col < this.#width; col++) {
        for (const direction of allDirections) {
          if (this.#history[direction][row][col]) {
            sum++;
            break;
          }
        }
      }
    }
    return sum;
  }

  hasHistory(beam: Beam): boolean {
    const { position, heading } = beam;
    return this.#history[heading][position.row][position.col];
  }

  edges(): { position: Position; heading: Direction }[] {
    let edges: { position: Position; heading: Direction }[] = [];

    for (let row = 0; row < this.#height; row++) {
      const left = { row, col: 0 };
      const right = { row, col: this.#width - 1 };
      edges.push({ position: left, heading: "E" });
      edges.push({ position: right, heading: "W" });
    }

    for (let col = 0; col < this.#width; col++) {
      const top = { col, row: 0 };
      const bottom = { col, row: this.#height - 1 };
      edges.push({ position: top, heading: "S" });
      edges.push({ position: bottom, heading: "N" });
    }

    return edges;
  }
}

class Beam {
  #grid: Grid;
  position: Position;
  heading: Direction;

  constructor(grid: Grid, heading: Direction, position: Position);
  constructor(other: Beam, heading: Direction);
  constructor(arg1: Grid | Beam, heading: Direction, position?: Position) {
    if (arg1 instanceof Grid) {
      this.#grid = arg1;
      this.position = position!;
      this.heading = heading;
    } else {
      this.#grid = arg1.#grid;
      this.position = structuredClone(arg1.position);
      this.heading = heading!;
    }
  }

  move(): boolean {
    switch (this.heading) {
      case "N":
        this.position.row--;
        break;
      case "E":
        this.position.col++;
        break;
      case "S":
        this.position.row++;
        break;
      case "W":
        this.position.col--;
        break;
    }
    return this.#grid.get(this.position) !== undefined;
  }

  reflect(mirror: Mirror): void {
    this.heading = Beam.reflect(mirror, this.heading);
  }

  static reflect(mirror: Mirror, heading: Direction): Direction {
    switch (mirror) {
      case "/":
        switch (heading) {
          case "N":
            return "E";
          case "E":
            return "N";
          case "S":
            return "W";
          case "W":
            return "S";
        }
      case "\\":
        switch (heading) {
          case "N":
            return "W";
          case "E":
            return "S";
          case "S":
            return "E";
          case "W":
            return "N";
        }
    }
  }

  split(splitter: Splitter): Beam[] | undefined {
    switch (splitter) {
      case "|":
        switch (this.heading) {
          case "N":
          case "S":
            return undefined;
          case "E":
          case "W":
            return [new Beam(this, "N"), new Beam(this, "S")];
        }
      case "-":
        switch (this.heading) {
          case "N":
          case "S":
            return [new Beam(this, "W"), new Beam(this, "E")];
          case "E":
          case "W":
            return undefined;
        }
    }
  }
}

function findEnergizedTiles(grid: Grid, firstBeam: Beam): number {
  grid.energize(firstBeam);
  const beams = new Set([firstBeam]);
  let energizedCount = -1;
  while (beams.size > 0) {
    energizedCount = grid.energizedCount();
    for (const beam of beams) {
      const position = grid.get(beam.position);
      switch (position) {
        case undefined:
          throw Error("The beam is off the map");
        case ".":
          break;
        case "/":
        case "\\":
          beam.reflect(position);
          break;
        case "|":
        case "-":
          const newBeams = beam.split(position);
          if (newBeams) {
            beams.delete(beam);
            newBeams.forEach((b) => beams.add(b));
            continue;
          }
          break;
      }

      const moved = beam.move();
      if (!moved || grid.hasHistory(beam)) beams.delete(beam);
      else grid.energize(beam);
    }
  }

  return energizedCount;
}

function part1(input: string): number {
  const grid = new Grid(input);
  const firstBeam = new Beam(grid, "E", { row: 0, col: 0 });
  return findEnergizedTiles(grid, firstBeam);
}

function part2(input: string): number {
  let maxEnergy = 0;
  const grid = new Grid(input);
  const edges = grid.edges();

  for (const edge of edges) {
    grid.reset();
    const firstBeam = new Beam(grid, edge.heading, edge.position);
    const energy = findEnergizedTiles(grid, firstBeam);
    maxEnergy = Math.max(maxEnergy, energy);
  }

  return maxEnergy;
}

async function main(file: string) {
  const input = await fs.readFile(file, { encoding: "utf8" });
  console.log(time(part1, input));
  console.log(time(part2, input));
}

main("inputs/day16");
