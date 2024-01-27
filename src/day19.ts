import * as fs from "fs/promises";
import { time } from "./timer";

const categories = ["x", "m", "a", "s"] as const;
type Category = (typeof categories)[number];
type Part = Record<Category, number>;
type PartFilter = Record<Category, CategoryFilter>;

class CategoryFilter {
	#filters = [{ lower: 1, upper: 4001 }];

	size() {
		return this.#filters.reduce((sum, f) => sum + (f.upper - f.lower), 0);
	}

	removingRange(lower: number, upper: number): CategoryFilter {
		const result = new CategoryFilter();
		result.#filters = this.#filters.map((filter) => {
			const remainingLesser = {
				lower: filter.lower,
				upper: Math.min(filter.upper, lower),
			};
			const remainingGreater = {
				lower: Math.max(filter.lower, upper + 1),
				upper: filter.upper,
			};

			if (remainingLesser.upper - remainingLesser.lower > 0) {
				return remainingLesser;
			} else {
				return remainingGreater;
			}
		});
		return result;
	}

	merge(other: CategoryFilter): void {
		const allFilters = this.#filters.concat(other.#filters);
		allFilters.sort((a, b) => a.lower - b.lower);
		this.#filters = allFilters.reduce((a, b) => {
			const last = a.length > 0 ? a[a.length - 1] : undefined;
			const next = {
				lower: Math.max(last?.upper ?? 1, b.lower),
				upper: b.upper,
			};
			if (next.upper - next.lower > 0) {
				a.push(next);
			}
			return a;
		}, [] as { lower: number; upper: number }[]);
	}
}

class Workflow {
	name: string;
	rules: Rule[];

	constructor(str: string) {
		const [name, rest] = str.split("{");
		this.name = name;
		const rulesStr = rest.slice(0, -1);
		this.rules = rulesStr.split(",").map((r) => new Rule(r));
	}

	destination(part: Part): string {
		for (const rule of this.rules) {
			if (!rule.category || !rule.symbol || !rule.threshold) continue;
			const value = part[rule.category];
			if (!value)
				throw new Error("Part is missing a rating for " + rule.category);
			switch (rule.symbol) {
				case "<":
					if (value < rule.threshold) return rule.destination;
					break;
				case ">":
					if (value > rule.threshold) return rule.destination;
					break;
			}
		}
		return this.rules[this.rules.length - 1].destination;
	}
}

class Rule {
	category?: Category;
	symbol?: "<" | ">";
	threshold?: number;
	destination: string;

	constructor(str: string) {
		if (str.indexOf(":") === -1) {
			this.destination = str;
			return;
		}
		const [rest, destination] = str.split(":");
		this.category = categories.find((cat) => cat === rest[0]);
		if (!this.category) throw new Error("Invalid rule category: " + rest[0]);
		if (rest[1] !== "<" && rest[1] !== ">")
			throw new Error("Invalid comparison: " + rest);
		this.symbol = rest[1];
		this.threshold = Number(rest.slice(2));
		this.destination = destination;
	}
}

function Part(str: string): Part {
	const ratingStrs = str.slice(1, -1).split(",");
	return {
		x: Number(ratingStrs[0].split("=")[1]),
		m: Number(ratingStrs[1].split("=")[1]),
		a: Number(ratingStrs[2].split("=")[1]),
		s: Number(ratingStrs[3].split("=")[1]),
	};
}

function process(part: Part, workflows: Map<string, Workflow>): "A" | "R" {
	let destination = "in";
	while (destination !== "A" && destination !== "R") {
		const workflow = workflows.get(destination);
		if (!workflow) throw new Error("Missing workflow: " + destination);
		destination = workflow.destination(part);
	}
	return destination;
}

function part1(input: string): number {
	const lines = input.split("\n");
	const blankLineIndex = lines.findIndex((l) => l === "");

	const workflows = lines
		.slice(0, blankLineIndex)
		.map((line) => new Workflow(line))
		.reduce((map, workflow) => {
			map.set(workflow.name, workflow);
			return map;
		}, new Map<string, Workflow>());

	const parts = lines
		.slice(blankLineIndex + 1)
		.filter((l) => l !== "") // avoid parsing possible empty line at the end
		.map((line) => Part(line));

	let sum = 0;
	for (const part of parts) {
		const result = process(part, workflows);
		if (result === "A") {
			sum += part.x;
			sum += part.m;
			sum += part.a;
			sum += part.s;
		}
	}
	return sum;
}

function totalCombinations(
	workflows: Map<string, Workflow>,
	next: string,
	ranges: PartFilter
): number {
	if (next === "A")
		return (
			ranges.x.size() * ranges.m.size() * ranges.a.size() * ranges.s.size()
		);
	if (next === "R") return 0;

	const flow = workflows.get(next);
	if (!flow) throw new Error("Workflow not found: " + next);

	let acceptedCombinations = 0;

	for (const rule of flow.rules) {
		const rangesAfterRule = filter(ranges, rule);
		const acceptedWithRule = totalCombinations(
			workflows,
			rule.destination,
			rangesAfterRule
		);
		acceptedCombinations += acceptedWithRule;
		ranges = filter(ranges, opposite(rule));
	}

	return acceptedCombinations;
}

function filter(filter: PartFilter, rule: Rule): PartFilter {
	if (!rule.category || !rule.symbol || !rule.threshold) {
		return filter;
	}
	const lower = rule.symbol === "<" ? rule.threshold : 1;
	const upper = rule.symbol === "<" ? 4001 : rule.threshold;
	const withRuleApplied = filter[rule.category].removingRange(lower, upper);
	return {
		...filter,
		[rule.category]: withRuleApplied,
	};
}

function opposite(rule: Rule): Rule {
	if (!rule.category || !rule.symbol || !rule.threshold) {
		return rule;
	}
	switch (rule.symbol) {
		case "<":
			return {
				category: rule.category,
				symbol: ">",
				threshold: rule.threshold - 1,
				destination: rule.destination,
			};
		case ">":
			return {
				category: rule.category,
				symbol: "<",
				threshold: rule.threshold + 1,
				destination: rule.destination,
			};
	}
}

function part2(input: string): number {
	const lines = input.split("\n");
	const blankLineIndex = lines.findIndex((l) => l === "");

	const workflows = lines
		.slice(0, blankLineIndex)
		.map((line) => new Workflow(line))
		.reduce((map, workflow) => {
			map.set(workflow.name, workflow);
			return map;
		}, new Map<string, Workflow>());

	const combinations = totalCombinations(workflows, "in", {
		x: new CategoryFilter(),
		m: new CategoryFilter(),
		a: new CategoryFilter(),
		s: new CategoryFilter(),
	})!;

	return combinations;
}

async function main(file: string) {
	const input = await fs.readFile(file, { encoding: "utf8" });
	console.log(time(part1, input));
	console.log(time(part2, input));
}

main("inputs/day19");
