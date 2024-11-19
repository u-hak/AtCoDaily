import { describe, expect, it } from "@effect/vitest";
import { type ChatInputCommandInteraction, InteractionType } from "discord.js";
import { Effect, Exit } from "effect";
import { PingCommand } from "./ping.ts";

describe("PingCommand execute", () => {
  it.effect("success", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        PingCommand.execute({
          type: InteractionType.ApplicationCommand,
        } as ChatInputCommandInteraction),
      );
      expect(result).toStrictEqual(Exit.succeed({ content: "pong!" }));
    }),
  );
});
