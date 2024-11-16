import { sum } from "./main.ts";
import { expect, test } from "vitest";

test("Just test", () => {
  expect(sum(1, 2)).toBe(3);
});
