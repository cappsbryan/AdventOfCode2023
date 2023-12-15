import * as fs from "fs/promises";

type Race = { time: number; distance: number };

async function part1(input: string): Promise<number> {
  const lines = input.split("\n");
  const races = getRacesPart1(lines);

  return races
    .map((race) => numberOfWaysToBeatTheRecord(race))
    .reduce((a, b) => a * b);
}

async function part2(input: string): Promise<number> {
  const lines = input.split("\n");
  const races = [getRacePart2(lines)];

  return races
    .map((race) => numberOfWaysToBeatTheRecord(race))
    .reduce((a, b) => a * b);
}

function getRacesPart1(lines: string[]): Race[] {
  const times = lines[0]
    .split(" ")
    .filter((n) => n != "")
    .map((n) => Number(n))
    .filter((n) => !Number.isNaN(n));

  const distances = lines[1]
    .split(" ")
    .filter((n) => n != "")
    .map((n) => Number(n))
    .filter((n) => !Number.isNaN(n));

  return times.map((time, index) => {
    return { time: time, distance: distances[index] };
  });
}

function getRacePart2(lines: string[]): Race {
  const numRegex = /[0-9]+/g;
  const times = lines[0].match(numRegex) || [0];
  const distances = lines[1].match(numRegex) || [0];
  return { time: Number(times.join("")), distance: Number(distances.join("")) };
}

function numberOfWaysToBeatTheRecord(race: Race): number {
  for (let holdDuration = 1; holdDuration <= race.time / 2; holdDuration++) {
    if (holdDuration * (race.time - holdDuration) > race.distance) {
      const total = Math.floor(race.time / 2) - holdDuration + 1;
      if (race.time % 2 == 0) {
        return total * 2 - 1;
      } else {
        return total * 2;
      }
    }
  }
  return 0;
}

async function main() {
  const input = await fs.readFile("inputs/day6", { encoding: "utf8" });
  console.log(await part1(input));
  console.log(await part2(input));
}

main();
