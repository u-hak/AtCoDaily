import type {
  ChatInputCommandInteraction,
  MessageCreateOptions,
  MessagePayload,
  SharedSlashCommand,
  SlashCommandBuilder,
} from "discord.js";
import { Data, type Effect } from "effect";

export interface DiscordCommand {
  readonly name: string;
  readonly slashCommand: SlashCommandBuilder | SharedSlashCommand;
  readonly execute: (
    input: ChatInputCommandInteraction,
  ) => Effect.Effect<MessageCreateOptions, CommandInternalError>;
}

export class InteractionError extends Data.TaggedError("InteractionError") {}
export class UnsupportedMessageType extends Data.TaggedError(
  "UnsupportedMessageType",
) {}

export class CommandNotFound extends Data.TaggedError("CommandNotFound") {}
export class CommandInternalError extends Data.TaggedError(
  "CommandInternalError",
) {
  public content: string;
  constructor(
    public readonly name: string,
    public readonly cause?: string,
  ) {
    super();
    if (cause) {
      this.content = `Command clashed when running \`${this.name}\`
Cause: ${cause}`;
    } else {
      this.content = `Command clashed when running \`${this.name}\``;
    }
  }
}
