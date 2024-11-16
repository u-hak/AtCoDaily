import { expect, test } from "vitest";
import { sum } from "./main.ts";

test("Just test", () => {
  expect(sum(1, 2)).toBe(3);
});
