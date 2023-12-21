import * as fs from "fs/promises";
import * as util from "util";

async function part1(input: string): Promise<number> {
  const lines = input.split("\n").filter((l) => l != "");
  let sum = 0;
  for (const line of lines) {
    const [row, groups] = line.split(" ");
    sum += possibleArrangements(
      row,
      groups.split(",").map((n) => Number(n))
    );
  }
  return sum;
}

async function part2(input: string): Promise<number> {
  const lines = input.split("\n").filter((l) => l != "");
  let sum = 0;
  for (const line of lines) {
    let [row, groups] = line.split(" ");
    row = Array(5).fill(row).join("?");
    groups = Array(5).fill(groups).join(",");
    cache.clear();
    const arrangementCount = possibleArrangements(
      row,
      groups.split(",").map((n) => Number(n))
    );
    sum += arrangementCount;
  }
  return sum;
}

let cache: Map<string, number> = new Map();

function possibleArrangements(row: string, groupCounts: number[]): number {
  const cached = cache.get(row + "-" + groupCounts);
  if (cached !== undefined) return cached;

  const groups = groupCounts.map((n) => "#".repeat(n));
  const shortestPossible = groups.join(".");
  const extraDotsNeeded = row.length - shortestPossible.length;

  if (extraDotsNeeded === 0) {
    const result = matches(row, shortestPossible) ? 1 : 0;
    cache.set(row + "-" + groupCounts, result);
    return result;
  }
  if (groupCounts.length === 0) {
    const result = matches(row, ".".repeat(extraDotsNeeded)) ? 1 : 0;
    return result;
  }

  let rows = 0;
  for (
    let firstExtraDots = 0;
    firstExtraDots <= extraDotsNeeded;
    firstExtraDots++
  ) {
    const spacer = groupCounts.length > 1 ? "." : "";
    const prefix = ".".repeat(firstExtraDots) + groups[0] + spacer;

    if (!matches(row, prefix)) continue;

    const rest = possibleArrangements(
      row.slice(prefix.length),
      groupCounts.slice(1)
    );
    rows += rest;
  }
  cache.set(row + "-" + groupCounts, rows);
  return rows;
}

function matches(row: string, prefix: string): boolean {
  let allMatch = true;
  for (let index = 0; index < prefix.length; index++) {
    if (row[index] !== "?" && row[index] !== prefix[index]) {
      allMatch = false;
      break;
    }
  }
  return allMatch;
}

async function time(
  part: (input: string) => Promise<number>,
  input: string
): Promise<string> {
  const start = performance.now();
  const result = await part(input);
  const time = performance.now() - start;
  return util.format("result: %d, in %d milliseconds", result, time);
}

async function main(file: string) {
  const input = await fs.readFile(file, { encoding: "utf8" });
  console.log(await time(part1, input));
  console.log(await time(part2, input));
}

main("inputs/day12");
