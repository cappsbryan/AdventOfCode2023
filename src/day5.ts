import * as fs from "fs/promises";

async function part1() {
  const input = await fs.readFile("inputs/day5", { encoding: "utf8" });
  const lines = input.split("\n");
  let lowestLocation = Infinity;

  const seeds = lines[0]
    .split(" ")
    .map((n) => Number(n))
    .filter((n) => !Number.isNaN(n));

  let maps: {
    destinationStart: number;
    sourceStart: number;
    length: number;
  }[][] = [];
  let currentMap: (typeof maps)[number] = [];

  for (const line of lines.slice(3)) {
    if (line == "") {
      maps.push(currentMap);
      currentMap = [];
    } else if (!line.endsWith("map:")) {
      const [d, s, l] = line.split(" ");
      currentMap.push({
        destinationStart: Number(d),
        sourceStart: Number(s),
        length: Number(l),
      });
    }
  }

  for (const seed of seeds) {
    let number = seed;
    for (const map of maps) {
      for (const range of map) {
        if (
          number >= range.sourceStart &&
          number < range.sourceStart + range.length
        ) {
          number += range.destinationStart - range.sourceStart;
          break;
        }
      }
    }
    if (number < lowestLocation) lowestLocation = number;
  }

  console.log(lowestLocation);
}

async function part2() {
  const input = await fs.readFile("inputs/day5", { encoding: "utf8" });
  const lines = input.split("\n");

  const seedRangeDefinitions = lines[0]
    .split(" ")
    .map((n) => Number(n))
    .filter((n) => !Number.isNaN(n));

  let seedRanges: { start: number; length: number }[] = [];
  for (let index = 0; index < seedRangeDefinitions.length; index += 2) {
    seedRanges.push({
      start: seedRangeDefinitions[index],
      length: seedRangeDefinitions[index + 1],
    });
  }

  let maps: {
    destinationStart: number;
    sourceStart: number;
    length: number;
  }[][] = [];
  let currentMap: (typeof maps)[number] = [];

  for (const line of lines.slice(3)) {
    if (line == "") {
      maps.push(currentMap);
      currentMap = [];
    } else if (!line.endsWith("map:")) {
      const [d, s, l] = line.split(" ");
      currentMap.push({
        destinationStart: Number(d),
        sourceStart: Number(s),
        length: Number(l),
      });
    }
  }
  maps.reverse();

  for (let location = 0; true; location++) {
    let number = location;
    for (const map of maps) {
      for (const range of map) {
        if (
          number >= range.destinationStart &&
          number < range.destinationStart + range.length
        ) {
          number += range.sourceStart - range.destinationStart;
          break;
        }
      }
    }
    let foundLocation = false;
    for (const seedRange of seedRanges) {
      if (
        number >= seedRange.start &&
        number < seedRange.start + seedRange.length
      ) {
        console.log(location, number, seedRange);
        foundLocation = true;
        break;
      }
    }
    if (foundLocation) break;
  }
}

part1().then(() => part2());
