import { describe, expect, it } from "vitest";
import { AtCoderSubmission, AtCoderTask, AtCoderUser } from "./type.ts";

describe("AtCoderSubmission.fromSeq", () => {
  it("valid", () => {
    expect(
      AtCoderSubmission.fromSeq([
        new Date(Date.parse("2024-11-16 23:17:14")),
        AtCoderUser.fromString("Alliana"),
        AtCoderTask.new({
          difficulty: "C",
          id: "abc380_c",
          name: "Move Segment",
        }),
        "AC",
      ]),
    ).toStrictEqual({
      date: new Date(Date.parse("2024-11-16 23:17:14")),
      user: AtCoderUser.fromString("Alliana"),
      task: AtCoderTask.new({
        difficulty: "C",
        id: "abc380_c",
        name: "Move Segment",
      }),
      status: "AC",
    });
  });
});
