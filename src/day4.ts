import * as fs from "fs/promises";

async function part1() {
  const input = await fs.readFile("inputs/day4", { encoding: "utf8" });
  const lines = input.split("\n");
  let sum = 0;

  for (const line of lines) {
    if (line.length == 0) continue;
    const [_, allTheNumbersString] = line.split(":");
    const [winningNumbersString, ourNumbersString] =
      allTheNumbersString.split("|");
    const winningNumbers = winningNumbersString.split(" ");
    const ourNumbers = ourNumbersString.split(" ");

    const ourWinningNumbers = ourNumbers.filter(
      (n) => n != "" && winningNumbers.indexOf(n) != -1
    );

    if (ourWinningNumbers.length > 0) {
      sum += 2 ** (ourWinningNumbers.length - 1);
    }
  }

  console.log(sum);
}

async function part2() {
  const input = await fs.readFile("inputs/day4", { encoding: "utf8" });
  const lines = input.split("\n");
  let counts: number[] = Array(lines.length).fill(1);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const [_, allTheNumbersString] = line.split(":");
    const [winningNumbersString, ourNumbersString] =
      allTheNumbersString.split("|");
    const winningNumbers = winningNumbersString.split(" ");
    const ourNumbers = ourNumbersString.split(" ");

    const ourWinningNumbers = ourNumbers.filter(
      (n) => n != "" && winningNumbers.indexOf(n) != -1
    );

    for (
      let copyIndex = lineIndex + 1;
      copyIndex <= lineIndex + ourWinningNumbers.length;
      copyIndex++
    ) {
      counts[copyIndex] += counts[lineIndex];
    }
  }

  console.log(counts.reduce((a, b) => a + b));
}

part1();
part2();
