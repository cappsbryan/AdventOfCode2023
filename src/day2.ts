import * as fs from "fs/promises";

async function part1() {
  const input = await fs.readFile("inputs/day2", { encoding: "utf8" });
  const lines = input.split("\n");
  let sum = 0;
  for (const game of lines) {
    const [gameLabel, setsString] = game.split(": ");
    if (!setsString) break;
    const sets = setsString.split("; ");
    let gameIsPossible = true;
    for (const set of sets) {
      let colors = { red: 0, green: 0, blue: 0 };
      for (const colorString of set.split(", ")) {
        const [count, color] = colorString.split(" ");
        if (color != "red" && color != "green" && color != "blue") break;
        colors[color] = Number(count);
      }
      if (colors.red > 12 || colors.green > 13 || colors.blue > 14) {
        gameIsPossible = false;
        break;
      }
    }
    if (gameIsPossible) {
      const [_, gameId] = gameLabel.split(" ");
      sum += Number(gameId);
    }
  }
  console.log(sum);
}

async function part2() {
  const input = await fs.readFile("inputs/day2", { encoding: "utf8" });
  const lines = input.split("\n");
  let sum = 0;
  for (const game of lines) {
    const [_, setsString] = game.split(": ");
    if (!setsString) break;
    const sets = setsString.split("; ");
    let colors = { red: 0, green: 0, blue: 0 };
    for (const set of sets) {
      for (const colorString of set.split(", ")) {
        const [count, color] = colorString.split(" ");
        if (color != "red" && color != "green" && color != "blue") break;
        colors[color] = Math.max(Number(count), colors[color]);
      }
    }
    const power = colors.red * colors.green * colors.blue;
    sum += power;
  }
  console.log(sum);
}

part1();
part2();
