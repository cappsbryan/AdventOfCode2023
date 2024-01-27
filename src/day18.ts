import * as fs from "fs/promises";
import { time } from "./timer";

type Direction = "U" | "D" | "L" | "R";
type VLine = { col: number; top: number; bottom: number };
type HSparseGridLines = Map<number, { left: number; right: number }[]>;

function findVerticalDelta(direction: Direction): number {
	switch (direction) {
		case "U":
			return -1;
		case "D":
			return 1;
		case "L":
			return 0;
		case "R":
			return 0;
	}
}

function findHorizontalDelta(direction: Direction): number {
	switch (direction) {
		case "U":
			return 0;
		case "D":
			return 0;
		case "L":
			return -1;
		case "R":
			return 1;
	}
}

class Dig {
	verticalLines: VLine[] = [];
	horizontalLines: HSparseGridLines = new Map();
	trenchDistance: number = 0;
	minRow = Infinity;
	minCol = Infinity;
	maxRow = -Infinity;
	maxCol = -Infinity;

	constructor(instructions: (readonly [Direction, number])[]) {
		let current = { row: 0, col: 0 };
		for (const [direction, distance] of instructions) {
			this.trenchDistance += distance;
			if (direction == "U" || direction == "D") {
				const verticalDelta = findVerticalDelta(direction);
				const start =
					direction === "D" ? current.row : current.row + verticalDelta;
				const end =
					direction === "U"
						? current.row + verticalDelta * distance
						: current.row + verticalDelta * (distance - 1);
				const line = {
					col: current.col,
					top: Math.min(start, end),
					bottom: Math.max(start, end),
				};
				this.verticalLines.push(line);
				this.verticalLines.sort((a, b) =>
					a.top === b.top ? a.bottom - b.bottom : a.top - b.top
				);
				current.row += distance * verticalDelta;
				if (current.row < this.minRow) this.minRow = current.row;
				if (current.row > this.maxRow) this.maxRow = current.row;
			} else {
				const horizontalDelta = findHorizontalDelta(direction);
				const previous = { ...current };
				current.col += distance * horizontalDelta;
				const lines = this.horizontalLines.get(current.row) ?? [];
				const line =
					direction === "L"
						? { left: current.col, right: previous.col }
						: { left: previous.col, right: current.col };
				lines.push(line);
				lines.sort((a, b) => a.left - b.left);
				this.horizontalLines.set(current.row, lines);
				if (current.col < this.minCol) this.minCol = current.col;
				if (current.col > this.maxCol) this.maxCol = current.col;
			}
		}
	}

	volume(): number {
		let count = this.trenchDistance;

		let groups: { row: number; size: number }[] = [];
		const horizontalLines = Array(...this.horizontalLines.keys()).sort(
			(a, b) => a - b
		);
		for (let i = 0; i < horizontalLines.length; i++) {
			groups.push({ row: horizontalLines[i], size: 1 });
			const size = horizontalLines[i + 1] - horizontalLines[i] - 1;
			groups.push({ row: horizontalLines[i] + 1, size });
		}

		for (const { row, size } of groups) {
			const togglePoints = this.verticalLines
				.filter((line) => row >= line.top && row <= line.bottom)
				.map((line) => line.col)
				.sort((a, b) => a - b);
			for (let i = 0; i < togglePoints.length - 1; i += 2) {
				const left = togglePoints[i] + 1;
				const right = togglePoints[i + 1] - 1;
				let segmentCount = right - left + 1;
				const horizontalLines = this.horizontalLines.get(row) ?? [];
				const clampedHorizontalLines = horizontalLines.map((line) => ({
					left: Math.max(line.left, left),
					right: Math.min(line.right, right),
				}));
				for (const horizontalLine of clampedHorizontalLines) {
					if (horizontalLine.right > horizontalLine.left) {
						segmentCount -= horizontalLine.right - horizontalLine.left + 1;
					}
				}
				if (segmentCount > 0) {
					count += segmentCount * size;
				}
			}
		}
		return count;
	}
}

function part1(input: string): number {
	const dig = new Dig(
		input
			.split("\n")
			.filter((l) => l !== "")
			.map((l) => {
				const [direction, distance, _] = l.split(" ");
				return [direction as Direction, Number(distance)] as const;
			})
	);
	return dig.volume();
}

function part2(input: string): number {
	const dig = new Dig(
		input
			.split("\n")
			.filter((l) => l !== "")
			.map((l) => {
				const [_, __, instruction] = l.split(" ");
				const distance = parseInt(instruction.slice(2, 7), 16);
				const direction = parseDirection(instruction.slice(7, 8));
				return [direction, distance] as const;
			})
	);
	return dig.volume();
}

function parseDirection(hex: string): Direction {
	switch (hex) {
		case "0":
			return "R";
		case "1":
			return "D";
		case "2":
			return "L";
		case "3":
			return "U";
		default:
			throw Error("Invalid direction hex digit");
	}
}

async function main(file: string) {
	const input = await fs.readFile(file, { encoding: "utf8" });
	console.log(time(part1, input));
	console.log(time(part2, input));
}

main("inputs/day18");
