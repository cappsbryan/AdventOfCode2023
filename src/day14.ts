import * as fs from "fs/promises";
import { time } from "./timer";

type Direction = "N" | "W" | "S" | "E";
type Position = { row: number; col: number };
type Sorter = (a: Position | undefined, b: Position | undefined) => number;

interface Rock extends Position {
  id: string;
}

class Platform {
  #cubes: Rock[] = [];
  #rocks: Rock[] = [];
  #height: number;
  #width: number;

  constructor(input: string) {
    const platform = input
      .split("\n")
      .filter((l) => l != "")
      .map((l) => l.split(""));
    this.#height = platform.length;
    this.#width = platform[0].length;
    for (let row = 0; row < this.#height; row++) {
      for (let col = 0; col < this.#width; col++) {
        const id = row + "-" + col;
        if (platform[row][col] === "#") {
          this.#cubes.push({ row, col, id });
        } else if (platform[row][col] === "O") {
          const rock = { row, col, id };
          this.#rocks.push(rock);
        }
      }
    }
  }

  grid(): string {
    let str = "";
    for (let row = 0; row < this.#height; row++) {
      for (let col = 0; col < this.#width; col++) {
        const predicate: (r: Position) => boolean = (r) =>
          r.row === row && r.col === col;
        if (this.#cubes.filter(predicate).length > 0) {
          str += "#";
        } else if (this.#rocks.filter(predicate).length > 0) {
          str += "O";
        } else {
          str += ".";
        }
      }
      str += "\n";
    }
    return str;
  }

  spin() {
    this.tilt("N");
    this.tilt("W");
    this.tilt("S");
    this.tilt("E");
  }

  tilt(direction: Direction) {
    const sorter = this.sorter(direction);
    const axis = this.tiltAxis(direction);
    const perpendicular = this.tiltPerpendicular(direction);
    this.#cubes.sort(sorter);
    this.#rocks.sort(sorter);

    let cubeIndex = 0;
    let previousRock: Rock | undefined;
    for (const rock of this.#rocks) {
      // set cubeIndex to point to the next cube after rock
      while (
        cubeIndex < this.#cubes.length &&
        sorter(rock, this.#cubes[cubeIndex]) > 0
      )
        cubeIndex++;
      // then set cube to the cube right before rock
      const cube = cubeIndex > 0 ? this.#cubes[cubeIndex - 1] : undefined;
      // set stopper to what the rock might be stopped by
      const stopper = sorter(previousRock, cube) < 0 ? cube : previousRock;

      if (stopper?.[perpendicular] === rock[perpendicular]) {
        rock[axis] = this.next(stopper[axis], direction);
      } else {
        rock[axis] = this.furthest(direction);
      }
      previousRock = rock;
    }
  }

  totalLoad(): number {
    return this.#rocks
      .map((rock) => this.#height - rock.row)
      .reduce((a, b) => a + b, 0);
  }

  sorter(direction: Direction): Sorter {
    const axis = this.tiltAxis(direction);
    const perp = this.tiltPerpendicular(direction);
    const sign = this.isSortAsc(direction) ? 1 : -1;
    return (a, b) => {
      if (a === undefined && b === undefined) return 0;
      else if (a === undefined) return -1;
      else if (b === undefined) return +1;
      const lowest =
        a[perp] === b[perp] ? a[axis] - b[axis] : a[perp] - b[perp];
      return sign * lowest;
    };
  }

  tiltAxis(direction: Direction): "row" | "col" {
    switch (direction) {
      case "N":
      case "S":
        return "row";
      case "E":
      case "W":
        return "col";
    }
  }

  tiltPerpendicular(direction: Direction): "row" | "col" {
    switch (direction) {
      case "N":
      case "S":
        return "col";
      case "E":
      case "W":
        return "row";
    }
  }

  next(axis: number, direction: Direction): number {
    return this.isSortAsc(direction) ? axis + 1 : axis - 1;
  }

  isSortAsc(direction: Direction): boolean {
    switch (direction) {
      case "N":
      case "W":
        return true;
      case "E":
      case "S":
        return false;
    }
  }

  furthest(direction: Direction): number {
    switch (direction) {
      case "N":
      case "W":
        return 0;
      case "E":
        return this.#width - 1;
      case "S":
        return this.#height - 1;
    }
  }
}

function part1(input: string): number {
  const platform = new Platform(input);

  platform.tilt("N");
  return platform.totalLoad();
}

function part2(input: string): number {
  const platform = new Platform(input);

  let gridLog: string[] = [];
  let spinCount = 0;
  let lastSpinGridIndex = 0;
  for (; spinCount < 1000000000; spinCount++) {
    const grid = platform.grid();
    lastSpinGridIndex = gridLog.indexOf(grid);
    if (lastSpinGridIndex !== -1) {
      gridLog.splice(0, lastSpinGridIndex);
      break;
    } else gridLog.push(grid);
    platform.spin();
  }

  const gridIndex = (1000000000 - spinCount) % gridLog.length;
  return new Platform(gridLog[gridIndex]).totalLoad();
}

async function main(file: string) {
  const input = await fs.readFile(file, { encoding: "utf8" });
  console.log(time(part1, input));
  console.log(time(part2, input));
}

main("inputs/day14");
