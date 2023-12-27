import { format } from "util";

export function time(part: (input: string) => number, input: string): string {
  const start = performance.now();
  const result = part(input);
  const time = performance.now() - start;
  return format("result: %d, in %d milliseconds", result, time);
}
