import * as fs from "fs/promises";

async function part1() {
  const input = await fs.readFile("inputs/day3", { encoding: "utf8" });
  const lines = input.split("\n");
  let numbers: {
    number: number;
    row: number;
    columns: number[];
  }[] = [];
  let symbols: Set<number>[] = [];
  for (let row = 0; row < lines.length; row++) {
    symbols.push(new Set());
    const line = lines[row];
    let currentNumber: (typeof numbers)[number] = {
      number: 0,
      row: row,
      columns: [],
    };
    for (let column = 0; column < line.length; column++) {
      const character = line[column];
      if (Number.isNaN(Number(character))) {
        if (currentNumber.number != 0) numbers.push(currentNumber);
        currentNumber = { number: 0, row: row, columns: [] };
        if (character != ".") {
          symbols[row].add(column);
        }
      } else {
        currentNumber.number = currentNumber.number * 10 + Number(character);
        currentNumber.columns.push(column);
        if (column == line.length - 1) {
          numbers.push(currentNumber);
        }
      }
    }
  }

  // just to make the below row - 1 and row + 1 bits play nice
  symbols[-1] = new Set();
  symbols.push(new Set());

  let sum = 0;
  for (const { number, row, columns } of numbers) {
    let isPartNumber = false;
    const leftColumn = columns[0] - 1;
    const rightColumn = columns[columns.length - 1] + 1;
    columns.push(leftColumn, rightColumn);
    for (const column of columns) {
      if (symbols[row - 1].has(column) || symbols[row + 1].has(column)) {
        isPartNumber = true;
        break;
      }
    }
    if (symbols[row].has(leftColumn) || symbols[row].has(rightColumn)) {
      isPartNumber = true;
    }

    if (isPartNumber) sum += number;
  }
  console.log(sum);
}

async function part2() {
  const input = await fs.readFile("inputs/day3", { encoding: "utf8" });
  const lines = input.split("\n");
  let numbers: number[][] = [];
  let asterisks: { row: number; column: number }[] = [];
  for (let row = 0; row < lines.length; row++) {
    numbers.push([]);
    const line = lines[row];
    let currentNumber: { number: number; columns: number[] } = {
      number: 0,
      columns: [],
    };
    for (let column = 0; column < line.length; column++) {
      numbers[row][column] = NaN;
      const character = line[column];
      if (Number.isNaN(Number(character))) {
        for (const column of currentNumber.columns) {
          numbers[row][column] = currentNumber.number;
        }
        currentNumber = { number: 0, columns: [] };
        if (character == "*") {
          asterisks.push({ row, column });
        }
      } else {
        currentNumber.number = currentNumber.number * 10 + Number(character);
        currentNumber.columns.push(column);
        if (column == line.length - 1) {
          for (const column of currentNumber.columns) {
            numbers[row][column] = currentNumber.number;
          }
        }
      }
    }
  }

  // just to make the below row - 1 and row + 1 bits play nice
  numbers[-1] = new Array(numbers[0].length).fill(NaN);
  numbers.push(new Array(numbers[0].length).fill(NaN));

  let sum = 0;
  for (const asterisk of asterisks) {
    let asteriskNumbers: number[] = [];
    for (let row = asterisk.row - 1; row <= asterisk.row + 1; row++) {
      let rowNumbers: number[] = [];
      for (
        let column = asterisk.column - 1;
        column <= asterisk.column + 1;
        column++
      ) {
        if (
          Number.isNaN(numbers[row][column]) ||
          rowNumbers.length == 0 ||
          Number.isNaN(rowNumbers[rowNumbers.length - 1])
        ) {
          rowNumbers.push(numbers[row][column]);
        }
      }
      asteriskNumbers.push(...rowNumbers.filter((n) => !Number.isNaN(n)));
    }
    if (asteriskNumbers.length == 2) {
      // that asterisk is a gear!
      sum += asteriskNumbers[0] * asteriskNumbers[1];
    }
  }
  console.log(sum);
}

part1();
part2();
