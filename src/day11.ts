import * as fs from "fs/promises";

class Space {
  #height: number;
  #width: number;
  #byRows: Map<number, number>;
  #byCols: Map<number, number>;

  constructor(length: number, width: number) {
    this.#height = length;
    this.#width = width;
    this.#byRows = new Map();
    this.#byCols = new Map();
  }

  addGalaxy(row: number, col: number) {
    this.#byRows.set(row, (this.#byRows.get(row) ?? 0) + 1);
    this.#byCols.set(col, (this.#byCols.get(col) ?? 0) + 1);
  }

  expand(multiple: number) {
    this.#height = Space.expandDirection(this.#height, this.#byRows, multiple);
    this.#width = Space.expandDirection(this.#width, this.#byCols, multiple);
  }

  static expandDirection(
    length: number,
    values: Map<number, number>,
    multiple: number
  ): number {
    let empty: number[] = [];
    for (let row = 0; row < length; row++) {
      if (!values.has(row)) {
        empty.push(row);
      }
    }

    const entries = Array<[number, number]>(...values.entries());
    entries.reverse();
    for (const [key, value] of entries) {
      const expansions = empty.filter((n) => n < key).length;
      const newKey = key + expansions * (multiple - 1);
      values.delete(key);
      values.set(newKey, value);
    }

    return values.size + empty.length * multiple;
  }

  totalDistance(): number {
    return Space.distance(this.#byRows) + Space.distance(this.#byCols);
  }

  static distance(values: Map<number, number>): number {
    let sum = 0;
    const entries = Array<[number, number]>(...values.entries());
    entries.sort((a, b) => a[0] - b[0]);
    for (let first = 0; first < entries.length; first++) {
      const [firstPosition, firstCount] = entries[first];
      for (let second = first + 1; second < entries.length; second++) {
        const [secondPosition, secondCount] = entries[second];
        sum += firstCount * secondCount * (secondPosition - firstPosition);
      }
    }
    return sum;
  }
}

async function part1(input: string): Promise<number> {
  const lines = input.split("\n").filter((l) => l != "");
  const length = lines.length;
  const width = lines[0].length;
  const space = new Space(length, width);

  for (let row = 0; row < length; row++) {
    for (let col = 0; col < width; col++) {
      if (lines[row][col] === "#") {
        space.addGalaxy(row, col);
      }
    }
  }
  space.expand(2);
  return space.totalDistance();
}

async function part2(input: string): Promise<number> {
  const lines = input.split("\n").filter((l) => l != "");
  const length = lines.length;
  const width = lines[0].length;
  const space = new Space(length, width);

  for (let row = 0; row < length; row++) {
    for (let col = 0; col < width; col++) {
      if (lines[row][col] === "#") {
        space.addGalaxy(row, col);
      }
    }
  }
  space.expand(1_000_000);
  return space.totalDistance();
}

async function main(file: string) {
  const input = await fs.readFile(file, { encoding: "utf8" });
  console.log(await part1(input));
  console.log(await part2(input));
}

main("inputs/day11");
