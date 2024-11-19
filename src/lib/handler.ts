import {
  type CacheType,
  type ChatInputCommandInteraction,
  type Interaction,
  InteractionType,
  type Message,
  type MessageCreateOptions,
} from "discord.js";
import { Effect } from "effect";
import {
  CommandNotFound,
  type DiscordCommand,
  InteractionError,
  UnsupportedMessageType,
} from "../commands/type.ts";

const isChatInputCommandInteraction = (
  input: Message | Interaction,
): input is ChatInputCommandInteraction<CacheType> =>
  input.type === InteractionType.ApplicationCommand &&
  input.isChatInputCommand();

export const validateInput = (input: Interaction) =>
  Effect.gen(function* () {
    if (isChatInputCommandInteraction(input)) {
      return input;
    }

    return yield* new UnsupportedMessageType();
  });

export const searchDiscordCommand = (cmds: DiscordCommand[], name: string) =>
  Effect.gen(function* () {
    const cmd = cmds.find((c) => c.name === name.toLowerCase());
    return cmd ? cmd : yield* new CommandNotFound();
  });

export const commandHandler =
  (cmds: DiscordCommand[]) =>
  (input: Interaction): Effect.Effect<MessageCreateOptions, null> =>
    Effect.Do.pipe(
      Effect.bind("interaction", () => validateInput(input)),
      Effect.tap(({ interaction }) =>
        Effect.tryPromise({
          try: () => interaction.deferReply(),
          catch: () => new InteractionError(),
        }),
      ),
      Effect.bind("cmd", ({ interaction }) =>
        searchDiscordCommand(cmds, interaction.commandName),
      ),
      Effect.bind("resp", ({ cmd, interaction }) => cmd.execute(interaction)),
      Effect.tap(({ interaction, resp }) => {
        Effect.runFork(
          Effect.log(
            `[Command handler] ${interaction.commandName} executed by ${input.member?.user.username}`,
            `Response: ${JSON.stringify(resp)}`,
          ),
        );
      }),
      Effect.map(({ resp }) => resp),
    ).pipe(
      Effect.catchTags({
        CommandNotFound: (e) => {
          Effect.runFork(Effect.logError(e));
          return Effect.succeed({ content: e.toString(), ephemeral: true });
        },
        CommandInternalError: (e) => {
          Effect.runFork(Effect.logError(e));
          return Effect.succeed({ content: e.content, ephemeral: true });
        },
        InteractionError: (e) => {
          return Effect.succeed({ content: e.toString(), ephemeral: true });
        },
        UnsupportedMessageType: (_) => Effect.fail(null),
      }),
    );
