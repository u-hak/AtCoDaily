import { describe, expect, it } from "@effect/vitest";
import {
  type Interaction,
  InteractionType,
  type Message,
  MessageType,
  SlashCommandBuilder,
} from "discord.js";
import { Effect, Exit } from "effect";
import {
  BotMessage,
  CommandInternalError,
  CommandNotFound,
  type DiscordCommand,
  DiscordInput,
  NotBotCommand,
  UnsupportedMessageType,
} from "../commands/type.ts";
import {
  commandHandler,
  generateDiscordInput,
  handleDiscordInput,
  parseCommandFromMessageContent,
} from "./handler.ts";

describe("parseCommandFromMessageContent", () => {
  it.effect("!ping", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        parseCommandFromMessageContent("!ping"),
      );
      expect(result).toStrictEqual(
        Exit.succeed({
          cmd: "ping",
          args: [],
        }),
      );
    }),
  );

  it.effect("!commandWithArgs aaa bbb ccc", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        parseCommandFromMessageContent("!commandWithArgs aaa bbb ccc"),
      );
      expect(result).toStrictEqual(
        Exit.succeed({
          cmd: "commandWithArgs",
          args: ["aaa", "bbb", "ccc"],
        }),
      );
    }),
  );

  it.effect("not a bot command", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        parseCommandFromMessageContent("notCommand"),
      );
      expect(result).toStrictEqual(Exit.fail(new NotBotCommand()));
    }),
  );
});

const DummyMessage = {
  valid: {
    type: MessageType.Default,
    id: "1",
    content: "!test",
    author: {
      bot: false,
    },
  } as Message,
  notACommand: {
    type: MessageType.Default,
    id: "2",
    content: "not a bot",
    author: {
      bot: false,
    },
  } as Message,
  bot: {
    type: MessageType.Default,
    id: "3",
    content: "!test",
    author: {
      bot: true,
    },
  } as Message,
  notFound: {
    type: MessageType.Default,
    id: "4",
    content: "!ping",
    author: {
      bot: false,
    },
  } as Message,
  fail: {
    type: MessageType.Default,
    id: "5",
    content: "!fail",
    author: {
      bot: false,
    },
  } as Message,
  cmdWithArgs: {
    type: MessageType.Default,
    id: "6",
    content: "!sum 3 5",
    author: {
      bot: false,
    },
  } as Message,
  cmdWithErrorArgs: {
    type: MessageType.Default,
    id: "7",
    content: "!sum a b",
    author: {
      bot: false,
    },
  } as Message,
};

const DummyInteraction = {
  valid: {
    type: InteractionType.ApplicationCommand,
    commandName: "test",
    deferReply: () => Promise.resolve(),
    id: "4",
  } as unknown as Interaction,
  invalid: {
    type: InteractionType.MessageComponent,
    id: "5",
  } as Interaction,
};

describe("generateDiscordInput test", () => {
  it.effect("success on valid message", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        generateDiscordInput(DummyMessage.valid),
      );
      expect(result).toStrictEqual(
        Exit.succeed(
          DiscordInput.new({
            type: "Message",
            messageId: "1",
            cmd: "test",
            args: [],
            message: DummyMessage.valid,
          }),
        ),
      );
    }),
  );

  it.effect("success on valid message with args", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        generateDiscordInput(DummyMessage.cmdWithArgs),
      );
      expect(result).toStrictEqual(
        Exit.succeed(
          DiscordInput.new({
            type: "Message",
            messageId: "6",
            cmd: "sum",
            args: ["3", "5"],
            message: DummyMessage.cmdWithArgs,
          }),
        ),
      );
    }),
  );

  it.effect("fail on not a command", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        generateDiscordInput(DummyMessage.notACommand),
      );
      expect(result).toStrictEqual(Exit.fail(new NotBotCommand()));
    }),
  );

  it.effect("fail on bot message", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(generateDiscordInput(DummyMessage.bot));
      expect(result).toStrictEqual(Exit.fail(new BotMessage()));
    }),
  );

  it.effect("success on valid ApplicationCommand", () =>
    Effect.gen(function* () {
      const result = yield* generateDiscordInput(DummyInteraction.valid);
      expect(result).toStrictEqual(
        DiscordInput.new({
          type: "ApplicationCommand",
          messageId: "4",
          cmd: "test",
          args: [],
        }),
      );
    }),
  );

  it.effect("fail on other interaction", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        generateDiscordInput(DummyInteraction.invalid),
      );
      expect(result).toStrictEqual(Exit.fail(new UnsupportedMessageType()));
    }),
  );
});

const testCommands: DiscordCommand[] = [
  {
    name: "test",
    slashCommand: new SlashCommandBuilder()
      .setName("test")
      .setDescription("Test"),
    execute: (_: DiscordInput) => {
      return Effect.succeed("test");
    },
  },
  {
    name: "fail",
    slashCommand: new SlashCommandBuilder()
      .setName("fail")
      .setDescription("Fail"),
    execute: (i: DiscordInput) => {
      return new CommandInternalError(
        i.cmd,
        i.args,
        "This command always fail!",
      );
    },
  },
  {
    name: "sum",
    slashCommand: new SlashCommandBuilder()
      .setName("sum")
      .setDescription("sum"),
    execute: (i: DiscordInput) => {
      const nums = i.args.map((n) => Number.parseInt(n));
      if (nums.some((v) => Number.isNaN(v))) {
        return new CommandInternalError(i.cmd, i.args);
      }
      return Effect.succeed(nums.reduce((x, y) => x + y).toString());
    },
  },
];

describe("handleDiscordInput test", () => {
  it.effect("success on valid input(message)", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        handleDiscordInput(testCommands)({
          type: "Message",
          cmd: "test",
          args: [],
          message: {} as Message,
          messageId: "1",
        }),
      );
      expect(result).toStrictEqual(Exit.succeed("test"));
    }),
  );

  it.effect("success on valid input with args", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        handleDiscordInput(testCommands)({
          type: "Message",
          messageId: "6",
          cmd: "sum",
          args: ["3", "5"],
          message: {} as Message,
        }),
      );
      expect(result).toStrictEqual(Exit.succeed("8"));
    }),
  );

  it.effect("fail on not found command(message)", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        handleDiscordInput(testCommands)({
          type: "Message",
          cmd: "notfound",
          args: [],
          message: {} as Message,
          messageId: "2",
        }),
      );
      expect(result).toStrictEqual(Exit.fail(new CommandNotFound("notfound")));
    }),
  );

  it.effect("fail on command internal error", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        handleDiscordInput(testCommands)({
          type: "Message",
          cmd: "fail",
          args: [],
          message: {} as Message,
          messageId: "3",
        }),
      );
      expect(result).toStrictEqual(
        Exit.fail(
          new CommandInternalError("fail", [], "This command always fail!"),
        ),
      );
    }),
  );

  it.effect("success on valid input(application command)", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        handleDiscordInput(testCommands)({
          type: "ApplicationCommand",
          cmd: "test",
          args: [],
          messageId: "3",
        }),
      );
      expect(result).toStrictEqual(Exit.succeed("test"));
    }),
  );
});

describe("commandHandler test", () => {
  it.effect("success on valid command(message)", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(testCommands)(DummyMessage.valid),
      );
      expect(result).toStrictEqual(Exit.succeed("test"));
    }),
  );

  it.effect("ignore on not a command(message)", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(testCommands)(DummyMessage.notACommand),
      );
      expect(result).toStrictEqual(Exit.fail(null));
    }),
  );

  it.effect("ignore on bot command(message)", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(testCommands)(DummyMessage.bot),
      );
      expect(result).toStrictEqual(Exit.fail(null));
    }),
  );

  it.effect("success on not found command(message)", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(testCommands)(DummyMessage.notFound),
      );
      expect(result).toStrictEqual(
        Exit.succeed({ content: "Command not found: `ping`" }),
      );
    }),
  );

  it.effect("success on command internal error", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(testCommands)(DummyMessage.fail),
      );
      expect(result).toStrictEqual(
        Exit.succeed({
          content:
            "Command clashed when running `fail []`\nCause: This command always fail!",
        }),
      );
    }),
  );

  it.effect("success on command with args", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(testCommands)(DummyMessage.cmdWithArgs),
      );
      expect(result).toStrictEqual(Exit.succeed("8"));
    }),
  );

  it.effect("success on command internal error", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(testCommands)(DummyMessage.cmdWithErrorArgs),
      );
      expect(result).toStrictEqual(
        Exit.succeed({ content: "Command clashed when running `sum [a,b]`" }),
      );
    }),
  );

  it.effect("ignore on unsupported message type", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        commandHandler(testCommands)(DummyInteraction.invalid),
      );
      expect(result).toStrictEqual(Exit.fail(null));
    }),
  );
});
