import * as fs from "fs/promises";

const cards = [
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
] as const;
const cardsWithJokers = [
  "A",
  "K",
  "Q",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
  "J",
] as const;
const types = ["5K", "4K", "FH", "3K", "2P", "1P", "HC"] as const;

type Card = (typeof cards)[number];
type Type = (typeof types)[number];

type Hand = {
  cards: Card[];
  type: (typeof types)[number];
};

async function part1(input: string): Promise<number> {
  const lines = input.split("\n");
  lines.pop();
  const plays = lines.map((line) => {
    const [cardsStr, bid] = line.split(" ");
    const cards = cardsStr.split("") as Card[];
    return {
      hand: { cards, type: findType(cards) },
      bid: Number(bid),
    };
  });
  plays.sort((a, b) => compare(a.hand, b.hand));

  let totalWinnings = 0;
  plays.forEach((play, index) => {
    const rank = index + 1;
    totalWinnings += play.bid * rank;
  });

  return totalWinnings;
}

async function part2(input: string): Promise<number> {
  const lines = input.split("\n");
  lines.pop();
  const plays = lines.map((line) => {
    const [cardsStr, bid] = line.split(" ");
    const cards = cardsStr.split("") as Card[];
    return {
      hand: { cards, type: findTypeWithJokers(cards) },
      bid: Number(bid),
    };
  });
  plays.sort((a, b) => compareWithJokers(a.hand, b.hand));

  let totalWinnings = 0;
  plays.forEach((play, index) => {
    const rank = index + 1;
    totalWinnings += play.bid * rank;
  });

  return totalWinnings;
}

function findType(cards: Card[]): Type {
  const counts = findCounts(cards);
  if (counts.size == 1) {
    return "5K";
  } else if (counts.size == 2) {
    const countOfFirstCard = counts.get(cards[0]);
    if (countOfFirstCard == 4 || countOfFirstCard == 1) {
      return "4K";
    } else {
      return "FH";
    }
  } else if (counts.size == 3) {
    let numberOfOneCounts = 0;
    counts.forEach((count) => {
      if (count == 1) numberOfOneCounts++;
    });
    if (numberOfOneCounts == 2) {
      return "3K";
    } else {
      return "2P";
    }
  } else if (counts.size == 4) {
    return "1P";
  } else {
    return "HC";
  }
}

function findTypeWithJokers(cards: Card[]): Type {
  const counts = findCounts(cards);
  const maxCount = replaceJokers(counts);

  if (maxCount == 5) {
    return "5K";
  } else if (maxCount == 4) {
    return "4K";
  } else if (maxCount == 3) {
    let numberOfOneCounts = 0;
    counts.forEach((count) => {
      if (count == 1) numberOfOneCounts++;
    });
    if (numberOfOneCounts == 2) {
      return "3K";
    } else {
      return "FH";
    }
  } else if (counts.size == 3) {
    return "2P";
  } else if (maxCount == 2) {
    return "1P";
  } else {
    return "HC";
  }
}

function findCounts(cards: Card[]): Map<Card, number> {
  let map = new Map<Card, number>();
  for (const card of cards) {
    const current = map.get(card) ?? 0;
    map.set(card, current + 1);
  }
  return map;
}

function replaceJokers(counts: Map<Card, number>): number {
  const countOfJokers = counts.get("J") ?? 0;
  counts.delete("J");

  let maxCount = 0;
  let maxCard: Card = "A";
  counts.forEach((count, card) => {
    if (count > maxCount) {
      maxCount = count;
      maxCard = card;
    }
  });

  const newMaxCount = maxCount + countOfJokers;
  counts.set(maxCard, newMaxCount);
  return newMaxCount;
}

function compare(a: Hand, b: Hand): number {
  const aTypeIndex = types.indexOf(a.type);
  const bTypeIndex = types.indexOf(b.type);
  if (aTypeIndex != bTypeIndex) {
    return bTypeIndex - aTypeIndex;
  }
  for (let cardNumber = 0; cardNumber < a.cards.length; cardNumber++) {
    if (a.cards[cardNumber] != b.cards[cardNumber]) {
      const aCardIndex = cards.indexOf(a.cards[cardNumber]);
      const bCardIndex = cards.indexOf(b.cards[cardNumber]);
      return aCardIndex < bCardIndex ? 1 : -1;
    }
  }
  return 0;
}

function compareWithJokers(a: Hand, b: Hand): number {
  const aTypeIndex = types.indexOf(a.type);
  const bTypeIndex = types.indexOf(b.type);
  if (aTypeIndex != bTypeIndex) {
    return bTypeIndex - aTypeIndex;
  }
  for (let cardNumber = 0; cardNumber < a.cards.length; cardNumber++) {
    if (a.cards[cardNumber] != b.cards[cardNumber]) {
      const aCardIndex = cardsWithJokers.indexOf(a.cards[cardNumber]);
      const bCardIndex = cardsWithJokers.indexOf(b.cards[cardNumber]);
      return aCardIndex < bCardIndex ? 1 : -1;
    }
  }
  return 0;
}

async function main(file: string) {
  const input = await fs.readFile(file, { encoding: "utf8" });
  console.log(await part1(input));
  console.log(await part2(input));
}

main("inputs/day7");
