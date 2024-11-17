import { readFileSync } from "node:fs";
import { getOrElse } from "fp-ts/lib/Either.js";
import { parse } from "node-html-parser";
import { describe, expect, it } from "vitest";
import { ElementNotFound, UnknownSubmissionStatus } from "./error.ts";
import {
  extractDate,
  extractStatus,
  extractTask,
  isValidSubmissionStatusExpr,
  scrapeSubmission,
} from "./submission.ts";
import { AtCoderTask } from "./type.ts";

describe("isValidSubmissionStatusExpr will judge", () => {
  it.each([
    { expr: "RE", expected: true },
    { expr: "TLE", expected: true },
    { expr: "WA", expected: true },
    { expr: "AC", expected: true },
    { expr: "re", expected: true },
    { expr: "tle", expected: true },
    { expr: "wa", expected: true },
    { expr: "ac", expected: true },
    { expr: "AA", expected: false },
  ])(
    "isValidSubmissionStatusExpr($expr) -> $expected",
    ({ expr, expected }) => {
      expect(isValidSubmissionStatusExpr(expr)).toBe(expected);
    },
  );
});

const root = parse(readFileSync("./testResources/submissions_page", "utf8"));
const invalidRoot = parse("<div>Invalid page</div>");

describe("extractDate", () => {
  it("should ok valid page", async () => {
    const data = await extractDate(root)();

    expect(getOrElse((e) => e)(data)).toStrictEqual(
      new Date(Date.parse("2024-11-16 23:17:14")),
    );
  });
  it("should error invalid page", async () => {
    const data = await extractDate(invalidRoot)();

    expect(getOrElse((e) => e)(data)).toBeInstanceOf(ElementNotFound);
  });
});

describe("extractTask", () => {
  it("should ok valid page", async () => {
    const data = await extractTask(root)();

    expect(getOrElse((e) => e)(data)).toStrictEqual(
      AtCoderTask.new({
        difficulty: "C",
        id: "abc380_c",
        name: "Move Segment",
      }),
    );
  });
  it("should error invalid page", async () => {
    const data = await extractTask(invalidRoot)();

    expect(getOrElse((e) => e)(data)).toBeInstanceOf(ElementNotFound);
  });
});

describe("extractStatus", () => {
  it("should ok valid page", async () => {
    const data = await extractStatus(root)();

    expect(getOrElse((e) => e)(data)).toBe("AC");
  });

  it("should error invalid status", async () => {
    const data = await extractStatus(
      parse(`
<div id="judge-status">
  <span>Invalid</span>
</div>
`),
    )();

    expect(getOrElse((e) => e)(data)).toBeInstanceOf(UnknownSubmissionStatus);
  });

  it("should error invalid page", async () => {
    const data = await extractStatus(invalidRoot)();

    expect(getOrElse((e) => e)(data)).toBeInstanceOf(ElementNotFound);
  });
});
