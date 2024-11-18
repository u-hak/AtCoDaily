import { describe, expect, it } from "@effect/vitest";
import type { Message } from "discord.js";
import { Effect, Exit } from "effect";
import { PingCommand } from "./ping.ts";

describe("PingCommand execute", () => {
  it.effect("success", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        PingCommand.execute({
          cmd: "ping",
          type: "Message",
          args: [],
          message: {} as Message,
          messageId: "1",
        }),
      );
      expect(result).toStrictEqual(Exit.succeed({ content: "pong!" }));
    }),
  );
});
