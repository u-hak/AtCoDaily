import { describe, expect, it } from "@effect/vitest";
import {
  type Interaction,
  InteractionType,
  type SlashCommandBuilder,
} from "discord.js";
import { Effect, Exit } from "effect";
import {
  CommandInternalError,
  CommandNotFound,
  type DiscordCommand,
  InteractionError,
  UnsupportedMessageType,
} from "../commands/type.ts";
import { commandHandler } from "./handler.ts";

const cmds: DiscordCommand[] = [
  {
    name: "test",
    execute: () => Effect.succeed({ content: "test" }),
    slashCommand: {} as SlashCommandBuilder,
  },
  {
    name: "fail",
    execute: () => Effect.fail(new CommandInternalError("fail")),
    slashCommand: {} as SlashCommandBuilder,
  },
];

const DummyInteraction = {
  success: {
    type: InteractionType.ApplicationCommand,
    commandName: "test",
    deferReply: () => Promise.resolve(),
    isChatInputCommand: () => true,
  } as unknown as Interaction,
  invalidInteraction: {
    type: InteractionType.Ping,
    commandName: "test",
    deferReply: () => Promise.resolve(),
    isChatInputCommand: () => true,
  } as unknown as Interaction,
  couldNotDeferReply: {
    type: InteractionType.ApplicationCommand,
    commandName: "test",
    deferReply: () => Promise.reject(),
    isChatInputCommand: () => true,
  } as unknown as Interaction,
  notFound: {
    type: InteractionType.ApplicationCommand,
    commandName: "notfound",
    deferReply: () => Promise.resolve(),
    isChatInputCommand: () => true,
  } as unknown as Interaction,
  executeError: {
    type: InteractionType.ApplicationCommand,
    commandName: "fail",
    deferReply: () => Promise.resolve(),
    isChatInputCommand: () => true,
  } as unknown as Interaction,
};

describe("commandHandler test", () => {
  it.effect("success", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(cmds)(DummyInteraction.success),
      );
      expect(result).toStrictEqual(
        Exit.succeed({
          content: "test",
        }),
      );
    }),
  );
  it.effect("ignore on invalid interaction", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(cmds)(DummyInteraction.invalidInteraction),
      );
      expect(result).toStrictEqual(Exit.fail(null));
    }),
  );
  it.effect("fail on could not deferReply", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(cmds)(DummyInteraction.couldNotDeferReply),
      );
      expect(result).toStrictEqual(
        Exit.succeed({
          content: new InteractionError().toString(),
          ephemeral: true,
        }),
      );
    }),
  );
  it.effect("fail on could not find DiscordCommand", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(cmds)(DummyInteraction.notFound),
      );
      expect(result).toStrictEqual(
        Exit.succeed({
          content: new CommandNotFound().toString(),
          ephemeral: true,
        }),
      );
    }),
  );
  it.effect("fail on cmd.execute failed", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(cmds)(DummyInteraction.executeError),
      );
      expect(result).toStrictEqual(
        Exit.succeed({
          content: new CommandInternalError("fail").content,
          ephemeral: true,
        }),
      );
    }),
  );
});
