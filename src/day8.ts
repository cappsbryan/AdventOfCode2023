import * as fs from "fs/promises";

async function part1(input: string): Promise<number> {
  const lines = input.split("\n");
  const instructions = lines[0];

  let network: { [index: string]: { left: string; right: string } } = {};
  for (const line of lines.slice(2)) {
    if (line == "") continue;
    const start = line.slice(0, 3);
    const left = line.slice(7, 10);
    const right = line.slice(12, 15);
    network[start] = { left, right };
  }

  let steps = 0;
  let current = "AAA";
  for (
    let instructionIndex = 0;
    true;
    instructionIndex = (instructionIndex + 1) % instructions.length
  ) {
    const instruction = instructions[instructionIndex];
    if (current == "ZZZ") {
      break;
    }
    if (instruction == "L") {
      current = network[current].left;
    } else {
      current = network[current].right;
    }
    steps++;
  }
  return steps;
}

type Network = { [index: string]: { left: string; right: string } };

async function part2(input: string): Promise<number> {
  const lines = input.split("\n");
  const instructions = lines[0];

  let network: Network = {};
  for (const line of lines.slice(2)) {
    if (line == "") continue;
    const start = line.slice(0, 3);
    const left = line.slice(7, 10);
    const right = line.slice(12, 15);
    network[start] = { left, right };
  }

  const nodes = Object.keys(network).filter((n) => n.endsWith("A"));

  const firstZDistance = nodes.map(
    (n) => findNextZ(n, instructions, network).distance
  );

  const lcm = findLCM(firstZDistance);
  return lcm * instructions.length;
}

function findNextZ(
  node: string,
  instructions: string,
  network: Network
): { distance: number; zNode: string } {
  let current = node;
  let distance = 0;
  do {
    current = follow(current, instructions, network);
    distance++;
  } while (!current.endsWith("Z"));
  return { distance, zNode: current };
}

function follow(node: string, instructions: string, network: Network): string {
  let current = node;
  for (const instruction of instructions) {
    const direction = instruction == "L" ? "left" : "right";
    current = network[current][direction];
  }
  return current;
}

function findLCM(ns: number[]): number {
  return ns.reduce((a, b) => {
    return findSingleLCM(a, b);
  });
}

function findSingleLCM(a: number, b: number): number {
  return a * (b / findSingleGCD(a, b));
}

function findSingleGCD(a: number, b: number): number {
  const max = Math.max(a, b);
  const min = Math.min(a, b);
  const remainder = max % min;
  if (remainder == 0) return min;
  else return findSingleGCD(remainder, min);
}

async function main(file: string) {
  const input = await fs.readFile(file, { encoding: "utf8" });
  console.log(await part1(input));
  console.log(await part2(input));
}

main("inputs/day8");
