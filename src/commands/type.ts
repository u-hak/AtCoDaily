import type {
  Message,
  MessageCreateOptions,
  MessagePayload,
  SlashCommandBuilder,
} from "discord.js";
import { Data, type Effect } from "effect";

export type DiscordInput =
  | {
      readonly type: "Message";
      readonly args: string[];
      readonly cmd: string;
      readonly messageId: string;
      readonly message: Message;
    }
  | {
      readonly type: "ApplicationCommand";
      readonly args: string[];
      readonly cmd: string;
      readonly messageId: string;
    };

export const DiscordInput = {
  new(arg: DiscordInput) {
    return { ...arg };
  },
};

export interface DiscordCommand {
  readonly name: string;
  readonly slashCommand: SlashCommandBuilder;
  readonly execute: (
    input: DiscordInput,
  ) => Effect.Effect<ResponseAvailable, CommandInternalError>;
}

export type ResponseAvailable = string | MessagePayload | MessageCreateOptions;

export class InteractionError extends Data.TaggedError("InteractionError") {}
export class NotBotCommand extends Data.TaggedError("NotBotCommand") {}
export class BotMessage extends Data.TaggedError("BotMessage") {}
export class UnsupportedMessageType extends Data.TaggedError(
  "UnsupportedMessageType",
) {}
export class CommandNotFound extends Data.TaggedError("CommandNotFound") {
  public content: string;
  constructor(public readonly cmd: string) {
    super();
    this.content = `Command not found: \`${cmd}\``;
  }
}

export class CommandInternalError extends Data.TaggedError(
  "CommandInternalError",
) {
  public content: string;
  constructor(
    public readonly di: DiscordInput,
    public readonly cause?: string,
  ) {
    super();
    if (cause) {
      this.content = `Command clashed when running \`${this.di.cmd} [${this.di.args}]\`
Cause: ${cause}`;
    } else {
      this.content = `Command clashed when running \`${this.di.cmd} [${this.di.args}]\``;
    }
  }
}
