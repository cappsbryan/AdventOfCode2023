import * as fs from "fs/promises";

async function part1(input: string): Promise<number> {
  const lines = input.split("\n").filter((l) => l != "");
  const histories = lines.map((line) => line.split(" ").map((n) => Number(n)));
  const predictions = histories.map((history) => predict(history));
  return predictions.reduce((a, b) => a + b);
}

async function part2(input: string): Promise<number> {
  const lines = input.split("\n").filter((l) => l != "");
  const histories = lines.map((line) => line.split(" ").map((n) => Number(n)));
  const predictions = histories.map((history) => predictBackward(history));
  return predictions.reduce((a, b) => a + b);
}

function predict(history: number[]): number {
  const differences = history.slice(1).map((value, index) => {
    return value - history[index];
  });
  if (differences.every((d) => d == 0)) {
    return history[0];
  }
  const predictedDifference = predict(differences);
  return history[history.length - 1] + predictedDifference;
}

function predictBackward(history: number[]): number {
  const differences = history.slice(1).map((value, index) => {
    return value - history[index];
  });
  if (differences.every((d) => d == 0)) {
    return history[0];
  }
  const predictedDifference = predictBackward(differences);
  return history[0] - predictedDifference;
}

async function main(file: string) {
  const input = await fs.readFile(file, { encoding: "utf8" });
  console.log(await part1(input));
  console.log(await part2(input));
}

main("inputs/day9");
