import * as fs from "fs/promises";
import { time } from "./timer";

type Lens = { label: string; focalLength: number };

function part1(input: string): number {
  const steps = input.split(",");
  return steps.reduce((a, b) => a + hash(b), 0);
}

function part2(input: string): number {
  const hashmap = new Map<number, Lens[]>();
  const steps = input.split(",");
  steps.forEach((s) => {
    const dashIndex = s.indexOf("-");
    if (dashIndex !== -1) {
      const label = s.slice(0, dashIndex);
      const boxNumber = hash(label);
      const box = hashmap.get(boxNumber);
      if (!box) return;
      const boxIndex = box.findIndex((l) => l.label === label);
      if (boxIndex !== -1) box.splice(boxIndex, 1);
    } else {
      const equalsIndex = s.indexOf("=");
      const label = s.slice(0, equalsIndex);
      const focalLength = Number(s.slice(equalsIndex + 1));
      const boxNumber = hash(label);
      const box = hashmap.get(boxNumber);
      const lens = { label, focalLength };
      if (!box) {
        hashmap.set(boxNumber, [lens]);
        return;
      }
      const boxIndex = box.findIndex((l) => l.label === label);
      if (boxIndex !== -1) box.splice(boxIndex, 1, lens);
      else box.push(lens);
    }
  });

  let totalFocusingPower = 0;
  for (const [boxNumber, box] of hashmap) {
    box.forEach((lens, boxIndex) => {
      const power = (1 + boxNumber) * (1 + boxIndex) * lens.focalLength;
      totalFocusingPower += power;
    });
  }
  return totalFocusingPower;
}

function hash(step: string): number {
  let currentValue = 0;
  for (let i = 0; i < step.length; i++) {
    const code = step.charCodeAt(i);
    currentValue += code;
    currentValue *= 17;
    currentValue %= 256;
  }
  return currentValue;
}

async function main(file: string) {
  const input = await fs.readFile(file, { encoding: "utf8" });
  console.log(time(part1, input));
  console.log(time(part2, input));
}

main("inputs/day15");
