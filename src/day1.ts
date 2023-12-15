import * as fs from "fs/promises";

async function part1() {
  const input = await fs.readFile("inputs/day1", { encoding: "utf8" });
  const lines = input.split("\n");
  let sum = 0;
  for (const line of lines) {
    let firstDigit = NaN;
    let lastDigit = NaN;

    for (const character of line) {
      const num = Number(character);
      if (!Number.isNaN(num)) {
        if (Number.isNaN(firstDigit)) firstDigit = num;
        lastDigit = num;
      }
    }
    const calibrationValue = firstDigit * 10 + lastDigit;
    if (Number.isNaN(calibrationValue)) continue;
    sum += calibrationValue;
  }
  console.log(sum);
}

async function part2() {
  const input = await fs.readFile("inputs/day1", { encoding: "utf8" });
  const lines = input.split("\n");
  let sum = 0;
  for (const line of lines) {
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const words = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];

    let firstPosition: number = Infinity;
    let firstDigit: number = 0;

    let lastPosition: number = -Infinity;
    let lastDigit: number = 0;

    for (let digit = 0; digit < 10; digit++) {
      const firstDigitPosition = line.indexOf(digits[digit]);
      const lastDigitPosition = line.lastIndexOf(digits[digit]);
      const firstWordPosition = line.indexOf(words[digit]);
      const lastWordPosition = line.lastIndexOf(words[digit]);
      if (firstDigitPosition != -1) {
        if (firstDigitPosition < firstPosition) {
          firstPosition = firstDigitPosition;
          firstDigit = digit;
        }
        if (lastDigitPosition > lastPosition) {
          lastPosition = lastDigitPosition;
          lastDigit = digit;
        }
      }
      if (firstWordPosition != -1) {
        if (firstWordPosition < firstPosition) {
          firstPosition = firstWordPosition;
          firstDigit = digit;
        }
        if (lastWordPosition > lastPosition) {
          lastPosition = lastWordPosition;
          lastDigit = digit;
        }
      }
    }
    const calibrationValue = firstDigit * 10 + lastDigit;
    sum += calibrationValue;
  }
  console.log(sum);
}

part1();
part2();
