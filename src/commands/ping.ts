import { SlashCommandBuilder } from "discord.js";
import { Effect } from "effect";
import type { DiscordCommand, DiscordInput } from "./type.ts";

export const PingCommand: DiscordCommand = {
  name: "ping",
  slashCommand: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pingコマンド"),
  execute: (_: DiscordInput) => {
    return Effect.succeed({
      content: "pong!",
    });
  },
};
