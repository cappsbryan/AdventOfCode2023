import { format } from "util";

export async function time(
  part: (input: string) => Promise<number>,
  input: string
): Promise<string> {
  const start = performance.now();
  const result = await part(input);
  const time = performance.now() - start;
  return format("result: %d, in %d milliseconds", result, time);
}
