import { SlashCommandBuilder } from "discord.js";
import { Effect } from "effect";
import type { DiscordCommand } from "./type.ts";

export const PingCommand: DiscordCommand = {
  name: "ping",
  slashCommand: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pingコマンド"),
  execute: () => {
    return Effect.succeed({
      content: "pong!",
    });
  },
};
