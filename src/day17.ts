import * as fs from "fs/promises";
import { time } from "./timer";

declare const positionHashSymbol: unique symbol;
type PositionHash = string & { [positionHashSymbol]: never };
declare const directionHashSymbol: unique symbol;
type DirectionHash = string & { [directionHashSymbol]: never };
const allDirections = ["N", "E", "S", "W"] as const;
type Direction = (typeof allDirections)[number];

function opposite(direction: Direction): Direction {
	switch (direction) {
		case "N":
			return "S";
		case "E":
			return "W";
		case "S":
			return "N";
		case "W":
			return "E";
	}
}

class Position {
	row: number;
	col: number;
	direction: Direction | undefined;

	constructor(row: number, col: number, direction?: Direction) {
		this.row = row;
		this.col = col;
		this.direction = direction;
	}

	static fromHash(hash: PositionHash | DirectionHash): Position {
		const [first, second, third] = hash.split(":");
		return new Position(
			Number(first),
			Number(second),
			third as Direction | undefined
		);
	}

	positionHash(): PositionHash {
		return [this.row, this.col].join(":") as PositionHash;
	}

	directionHash(): DirectionHash {
		return [this.row, this.col, this.direction].join(":") as DirectionHash;
	}
}

class Grid {
	#lossMap: Map<PositionHash, number>;
	#height: number;
	#width: number;
	#minBlocks: number;
	#maxBlocks: number;

	constructor(input: string, minBlocks: number, maxBlocks: number) {
		const lines = input.split("\n").filter((l) => l !== "");
		this.#height = lines.length;
		this.#width = lines[0].length;
		this.#minBlocks = minBlocks;
		this.#maxBlocks = maxBlocks;

		this.#lossMap = new Map();
		for (let r = 0; r < this.#height; r++) {
			for (let c = 0; c < this.#width; c++) {
				const current = new Position(r, c);
				this.#lossMap.set(current.positionHash(), Number(lines[r][c]));
			}
		}
	}

	minHeatLoss(): number {
		const start = new Position(0, 0).positionHash();
		return this.#aStar(start);
	}

	#aStar(start: PositionHash): number {
		const goal = new Position(this.#height - 1, this.#width - 1).positionHash();
		const startNode = Position.fromHash(start).directionHash();
		const openSet: DirectionHash[] = [startNode];

		const gScore: Map<DirectionHash, number> = new Map();
		gScore.set(startNode, 0);

		const fScore: Map<DirectionHash, number> = new Map();
		fScore.set(startNode, this.#h(startNode));

		while (openSet.length > 0) {
			openSet.sort((a, b) => fScore.get(b)! - fScore.get(a)!);
			const current = openSet.pop()!;
			if (Position.fromHash(current).positionHash() === goal) {
				return fScore.get(current)!;
			}

			const neighbors = this.#neighbors(current)!;
			for (const { position, loss } of neighbors) {
				const neighbor = position.directionHash();
				const tentativeGScore = gScore.get(current)! + loss;
				if (tentativeGScore < (gScore.get(neighbor) ?? Infinity)) {
					gScore.set(neighbor, tentativeGScore);
					fScore.set(neighbor, tentativeGScore + this.#h(neighbor));
					if (openSet.indexOf(neighbor) === -1) {
						openSet.push(neighbor);
					}
				}
			}
		}
		throw Error("Destination never found");
	}

	#neighbors(current: DirectionHash): { position: Position; loss: number }[] {
		const position = Position.fromHash(current);
		let neighbors: { position: Position; loss: number }[] = [];
		for (const direction of allDirections) {
			for (let blocks = this.#minBlocks; blocks <= this.#maxBlocks; blocks++) {
				const neighbor = this.next(position, direction, blocks);
				if (neighbor) neighbors.push(neighbor);
				else break;
			}
		}
		return neighbors;
	}

	next(
		position: Position,
		direction: Direction,
		blocks: number
	): { position: Position; loss: number } | undefined {
		if (position.direction === direction) return;
		if (position.direction === opposite(direction)) return;

		const newPosition = new Position(position.row, position.col, direction);
		let loss = 0;
		for (let i = 0; i < blocks; i++) {
			switch (direction) {
				case "N":
					newPosition.row = newPosition.row - 1;
					break;
				case "E":
					newPosition.col = newPosition.col + 1;
					break;
				case "S":
					newPosition.row = newPosition.row + 1;
					break;
				case "W":
					newPosition.col = newPosition.col - 1;
					break;
			}
			const maybeLoss = this.#lossMap.get(newPosition.positionHash());
			if (maybeLoss === undefined) return undefined;
			loss += maybeLoss;
		}
		return { position: newPosition, loss };
	}

	#h(nodeHash: DirectionHash): number {
		const node = Position.fromHash(nodeHash);
		const verticalDistance = this.#height - node.row - 1;
		const horizontalDistance = this.#width - node.col - 1;
		return verticalDistance + horizontalDistance;
	}
}

function part1(input: string): number {
	const grid = new Grid(input, 1, 3);
	return grid.minHeatLoss();
}

function part2(input: string): number {
	const grid = new Grid(input, 4, 10);
	return grid.minHeatLoss();
}

async function main(file: string) {
	const input = await fs.readFile(file, { encoding: "utf8" });
	console.log(time(part1, input));
	console.log(time(part2, input));
}

main("inputs/day17");
