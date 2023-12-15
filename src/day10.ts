import * as fs from "fs/promises";

type Tile = "|" | "-" | "L" | "J" | "7" | "F" | "." | "S";
type Direction = "N" | "E" | "S" | "W";

class Cell {
  grid: [
    [boolean, boolean, boolean],
    [boolean, boolean, boolean],
    [boolean, boolean, boolean]
  ];
  isS = false;

  constructor(grid?: Cell["grid"]) {
    this.grid = grid ?? [
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ];
  }

  get center(): boolean {
    return this.grid[1][1];
  }

  set center(value) {
    this.grid[1][1] = value;
  }

  get top(): boolean {
    return this.grid[0][1];
  }

  set top(value) {
    this.grid[0][1] = value;
  }

  get right(): boolean {
    return this.grid[1][2];
  }

  set right(value) {
    this.grid[1][2] = value;
  }

  get bottom(): boolean {
    return this.grid[2][1];
  }

  set bottom(value) {
    this.grid[2][1] = value;
  }

  get left(): boolean {
    return this.grid[1][0];
  }

  set left(value) {
    this.grid[1][0] = value;
  }
}

class Grid {
  #grid: boolean[][];
  #visited: boolean[][];
  #outside: boolean[][];
  sCenter: Position;
  width: number;
  height: number;

  constructor(lines: string[]) {
    const g = Grid.formGrid(lines);
    this.#grid = g.grid;
    this.#visited = Grid.emptyGrid(lines);
    this.#outside = Grid.emptyGrid(lines);
    this.sCenter = g.sCenter;
    this.height = this.#grid.length;
    this.width = this.#grid[0].length;
  }

  static formGrid(lines: string[]): { grid: boolean[][]; sCenter: Position } {
    const grid = Grid.emptyGrid(lines);
    let sCenter = new Position(0, 0);

    for (let lineRow = 0; lineRow < lines.length; lineRow++) {
      for (let lineColumn = 0; lineColumn < lines[0].length; lineColumn++) {
        const cell = Grid.fillCell(lines, lineRow, lineColumn);
        if (cell.isS)
          sCenter = new Position(lineRow * 3 + 1, lineColumn * 3 + 1);
        for (let cellRow = 0; cellRow < 3; cellRow++) {
          const gridRow = lineRow * 3 + cellRow;
          for (let cellColumn = 0; cellColumn < 3; cellColumn++) {
            const gridColumn = lineColumn * 3 + cellColumn;
            grid[gridRow][gridColumn] = cell.grid[cellRow][cellColumn];
          }
        }
      }
    }

    return { grid, sCenter };
  }

  static emptyGrid(lines: string[]): boolean[][] {
    return Array<boolean>(lines.length * 3)
      .fill(false)
      .map(() => Array<boolean>(lines[0].length * 3).fill(false));
  }

  static fillCell(lines: string[], row: number, column: number): Cell {
    const tile = lines[row][column] as Tile;
    switch (tile) {
      case "|":
        return new Cell([
          [false, true, false],
          [false, true, false],
          [false, true, false],
        ]);
      case "-":
        return new Cell([
          [false, false, false],
          [true, true, true],
          [false, false, false],
        ]);
      case "L":
        return new Cell([
          [false, true, false],
          [false, true, true],
          [false, false, false],
        ]);
      case "J":
        return new Cell([
          [false, true, false],
          [true, true, false],
          [false, false, false],
        ]);
      case "7":
        return new Cell([
          [false, false, false],
          [true, true, false],
          [false, true, false],
        ]);
      case "F":
        return new Cell([
          [false, false, false],
          [false, true, true],
          [false, true, false],
        ]);
      case ".":
        return new Cell([
          [false, false, false],
          [false, false, false],
          [false, false, false],
        ]);
      case "S":
        return Grid.fillS(lines, row, column);
    }
  }

  static fillS(lines: string[], row: number, column: number): Cell {
    let cell = new Cell();
    cell.isS = true;
    cell.center = true;
    if (row > 0 && this.fillCell(lines, row - 1, column).bottom) {
      cell.top = true;
    }
    if (
      column + 1 < lines[0].length &&
      this.fillCell(lines, row, column + 1).left
    ) {
      cell.right = true;
    }
    if (row + 1 < lines.length && this.fillCell(lines, row + 1, column).top) {
      cell.bottom = true;
    }
    if (column > 0 && this.fillCell(lines, row, column - 1).right) {
      cell.left = true;
    }
    return cell;
  }

  get(position: Position): boolean;
  get(position: Position, direction: Direction): boolean | undefined;
  get(
    position: Position,
    direction: Direction | undefined = undefined
  ): boolean | undefined {
    if (direction) {
      const neighborPos = this.neighbor(position, direction);
      if (!neighborPos) return undefined;
      position = neighborPos;
    }
    return this.#grid[position.row][position.column];
  }

  neighbor(position: Position, direction: Direction): Position | undefined {
    switch (direction) {
      case "N":
        if (position.row == 0) return undefined;
        return new Position(position.row - 1, position.column);
      case "E":
        if (position.column == this.width - 1) return undefined;
        return new Position(position.row, position.column + 1);
      case "S":
        if (position.row == this.height - 1) return undefined;
        return new Position(position.row + 1, position.column);
      case "W":
        if (position.column == 0) return undefined;
        return new Position(position.row, position.column - 1);
    }
  }

  validMoves(position: Position): Position[] {
    return [
      this.neighbor(position, "N"),
      this.neighbor(position, "E"),
      this.neighbor(position, "S"),
      this.neighbor(position, "W"),
    ].filter((p): p is Position => !!p && this.get(p));
  }

  markVisited(position: Position) {
    this.#visited[position.row][position.column] = true;
  }

  markOutside(position: Position) {
    this.#outside[position.row][position.column] = true;
  }

  outside(position: Position): boolean {
    return this.#outside[position.row][position.column];
  }

  clearUnvisited() {
    for (let row = 0; row < this.height; row++) {
      for (let column = 0; column < this.width; column++) {
        this.#grid[row][column] = this.#visited[row][column];
      }
    }
  }

  insideArea(): number {
    let area = 0;
    for (let row = 1; row < this.height; row += 3) {
      for (let column = 1; column < this.width; column += 3) {
        if (!this.#outside[row][column] && !this.#visited[row][column]) {
          area++;
        }
      }
    }
    return area;
  }
}

class Position {
  row: number;
  column: number;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  equals(other: Position | undefined): boolean {
    if (!other) return false;
    return this.row == other.row && this.column == other.column;
  }
}

async function part1(input: string): Promise<number> {
  const lines = input.split("\n").filter((l) => l != "");
  const grid = new Grid(lines);
  const totalLength = findLength(grid, grid.sCenter);
  return totalLength / 6;
}

async function part2(input: string): Promise<number> {
  const lines = input.split("\n").filter((l) => l != "");
  const grid = new Grid(lines);
  findLength(grid, grid.sCenter);
  grid.clearUnvisited();
  findOutsideArea(grid);
  return grid.insideArea();
}

function findLength(grid: Grid, s: Position): number {
  let length = 0;
  let current = s;
  let previous: Position | undefined = undefined;
  do {
    const next = move(grid, current, previous);
    previous = current;
    current = next;
    grid.markVisited(current);
    length++;
  } while (!current.equals(s));
  return length;
}

function move(
  grid: Grid,
  position: Position,
  previous: Position | undefined
): Position {
  return grid.validMoves(position).filter((m) => !m.equals(previous))[0];
}

function findOutsideArea(grid: Grid) {
  let startingPoint = new Position(0, 0);
  while (grid.get(startingPoint)) {
    const east = grid.neighbor(startingPoint, "E");
    const south = grid.neighbor(startingPoint, "S");
    const west = grid.neighbor(startingPoint, "W");
    const north = grid.neighbor(startingPoint, "N");
    if (east && grid.get(east)) startingPoint = east;
    else if (south && grid.get(south)) startingPoint = south;
    else if (west && grid.get(west)) startingPoint = west;
    else if (north && grid.get(north)) startingPoint = north;
  }

  flood(grid, startingPoint);
}

function flood(grid: Grid, position: Position) {
  let toFlood: Position[] = [position];
  while (toFlood.length > 0) {
    const next = toFlood.pop();
    if (!next || grid.get(next) || grid.outside(next)) continue;
    grid.markOutside(next);
    const north = grid.neighbor(next, "N");
    if (north) toFlood.push(north);
    const east = grid.neighbor(next, "E");
    if (east) toFlood.push(east);
    const south = grid.neighbor(next, "S");
    if (south) toFlood.push(south);
    const west = grid.neighbor(next, "W");
    if (west) toFlood.push(west);
  }
}

async function main(file: string) {
  const input = await fs.readFile(file, { encoding: "utf8" });
  console.log(await part1(input));
  console.log(await part2(input));
}

main("inputs/day10");
