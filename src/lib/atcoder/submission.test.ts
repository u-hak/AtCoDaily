import { readFileSync } from "node:fs";
import { it } from "@effect/vitest";
import { Effect } from "effect";
import { parse } from "node-html-parser";
import { describe, expect } from "vitest";
import { DateTransformer } from "./submission.ts";

const root = parse(readFileSync("./testResources/submissions_page", "utf8"));
const invalidRoot = parse("<div>Invalid page</div>");

describe("DateTransformer", () => {
  it.effect("test success", () =>
    Effect.gen(function* () {
      const result = yield* DateTransformer(parse("<div>2024-01-01 00:00:00"));
      expect(result).toStrictEqual(new Date(Date.parse("2024-01-01 00:00:00")));
    }),
  );
});
