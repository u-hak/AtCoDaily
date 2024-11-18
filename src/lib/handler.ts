import {
  type Interaction,
  InteractionType,
  type Message,
  MessageType,
} from "discord.js";
import { Console, Effect } from "effect";
import {
  BotMessage,
  CommandNotFound,
  type DiscordCommand,
  DiscordInput,
  InteractionError,
  NotBotCommand,
  UnsupportedMessageType,
} from "../commands/type.ts";

export const parseCommandFromMessageContent = (content: string) =>
  Effect.gen(function* () {
    if (!content.startsWith("!")) {
      return yield* new NotBotCommand();
    }

    const [cmd, ...args] = content.split(" ");

    return {
      cmd: cmd.substring(1),
      args,
    };
  });

export function generateDiscordInput(userInput: Message | Interaction) {
  return Effect.gen(function* () {
    if (userInput.type === MessageType.Default) {
      if (userInput.author.bot) {
        return yield* new BotMessage();
      }

      const { cmd, args } = yield* parseCommandFromMessageContent(
        userInput.content,
      );

      return DiscordInput.new({
        type: "Message",
        messageId: userInput.id,
        cmd,
        args,
        message: userInput,
      });
    }

    if (userInput.type === InteractionType.ApplicationCommand) {
      yield* Effect.tryPromise({
        try: () => userInput.deferReply(),
        catch: (_) => new InteractionError(),
      });

      return DiscordInput.new({
        type: "ApplicationCommand",
        messageId: userInput.id,
        cmd: userInput.commandName,
        args: [], // TODO: Fix later
      });
    }

    return yield* new UnsupportedMessageType();
  });
}

export const handleDiscordInput =
  (cmds: DiscordCommand[]) => (input: DiscordInput) =>
    Effect.gen(function* () {
      const cmd = cmds.find((c) => c.name === input.cmd.toLowerCase());
      if (!cmd) {
        return yield* new CommandNotFound(input.cmd);
      }

      return yield* cmd.execute(input);
    });

export const commandHandler =
  (cmds: DiscordCommand[]) => (input: Message | Interaction) =>
    Effect.Do.pipe(
      Effect.bind("di", () => generateDiscordInput(input)),
      Effect.bind("resp", ({ di }) => handleDiscordInput(cmds)(di)),
      Effect.tap(({ resp, di }) => {
        Effect.runFork(
          Effect.log(
            `[Command handler] ${di.cmd} executed by ${input.member?.user.username} via ${di.type}`,
            `Response: ${JSON.stringify(resp)}`,
          ),
        );
      }),
      Effect.map(({ resp }) => resp),
    ).pipe(
      Effect.catchTags({
        CommandNotFound: (e) => {
          Effect.runFork(Effect.logError(e));
          return Effect.succeed({ content: e.content });
        },
        CommandInternalError: (e) => {
          Effect.runFork(Effect.logError(e));
          return Effect.succeed({ content: e.content });
        },
        InteractionError: (e) => {
          Effect.runFork(Effect.logError(e));
          return Effect.succeed({ content: "Interaction error" });
        },
        BotMessage: (_) => Effect.fail(null),
        NotBotCommand: (_) => Effect.fail(null),
        UnsupportedMessageType: (_) => Effect.fail(null),
      }),
    );
