import * as fs from "fs/promises";
import { time } from "./timer";

function part1(input: string): number {
  const lines = input.split("\n");
  const paths = split(lines, (l) => l === "");

  const summaries = paths.map((path) => {
    for (let row = 1; row < path.length; row++) {
      let match = true;
      const maxOffset = Math.min(path.length - row - 1, row - 1);
      for (let offset = 0; offset <= maxOffset; offset++) {
        if (path[row + offset] !== path[row - offset - 1]) {
          match = false;
          break;
        }
      }
      if (match) return row * 100;
    }

    for (let col = 1; col < path[0].length; col++) {
      let match = true;
      const maxOffset = Math.min(path[0].length - col - 1, col - 1);
      for (let offset = 0; offset <= maxOffset; offset++) {
        for (let row = 0; row < path.length; row++) {
          if (path[row][col + offset] !== path[row][col - offset - 1]) {
            match = false;
            break;
          }
        }
      }
      if (match) return col;
    }

    throw Error("Line of reflection not found");
  });

  return summaries.reduce((a, b) => a + b);
}

function part2(input: string): number {
  const lines = input.split("\n");
  const paths = split(lines, (l) => l === "");

  const summaries = paths.map((path) => {
    for (let row = 1; row < path.length; row++) {
      let smudges = 0;
      const maxOffset = Math.min(path.length - row - 1, row - 1);
      for (let offset = 0; offset <= maxOffset; offset++) {
        for (let col = 0; col < path[row].length; col++) {
          if (path[row + offset][col] !== path[row - offset - 1][col]) {
            smudges++;
          }
        }
      }
      if (smudges === 1) return row * 100;
    }

    for (let col = 1; col < path[0].length; col++) {
      let smudges = 0;
      const maxOffset = Math.min(path[0].length - col - 1, col - 1);
      for (let offset = 0; offset <= maxOffset; offset++) {
        for (let row = 0; row < path.length; row++) {
          if (path[row][col + offset] !== path[row][col - offset - 1]) {
            smudges++;
          }
        }
      }
      if (smudges === 1) return col;
    }

    throw Error("Line of reflection not found");
  });

  return summaries.reduce((a, b) => a + b);
}

function split<T>(lines: T[], splitter: (line: T) => boolean): T[][] {
  let res: T[][] = [];
  let push = true;
  for (const line of lines) {
    const split = splitter(line);
    if (split) {
      push = true;
    } else if (push) {
      res.push([line]);
      push = false;
    } else {
      res[res.length - 1].push(line);
    }
  }
  return res;
}

async function main(file: string) {
  const input = await fs.readFile(file, { encoding: "utf8" });
  console.log(await time(part1, input));
  console.log(await time(part2, input));
}

main("inputs/day13");
