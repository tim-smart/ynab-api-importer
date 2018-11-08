import { parse } from "ofx-js";

export function parseBnz(input: string) {
  return parse(input);
}
