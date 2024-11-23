import {
  type ChatInputCommandInteraction,
  type InteractionReplyOptions,
  type SharedSlashCommand,
  type SlashCommandBuilder,
  codeBlock,
} from "discord.js";
import { Data, type Effect } from "effect";

export interface DiscordCommand {
  readonly name: string;
  readonly slashCommand: SlashCommandBuilder | SharedSlashCommand;
  readonly execute: (
    input: ChatInputCommandInteraction,
  ) => Effect.Effect<InteractionReplyOptions, CommandInternalError>;
}

export class InteractionError extends Data.TaggedError("InteractionError") {}
export class UnsupportedMessageType extends Data.TaggedError(
  "UnsupportedMessageType",
) {}

export class CommandNotFound extends Data.TaggedError("CommandNotFound") {}
export class CommandInternalError extends Data.TaggedError(
  "CommandInternalError",
)<{ name: string; cause?: unknown }> {}

export const formatCommandInternalError = (e: CommandInternalError): string => {
  return `コマンド実行時にエラーが発生しました．\nFull log: ${codeBlock("json", JSON.stringify(e, null, "\t"))}`;
};
