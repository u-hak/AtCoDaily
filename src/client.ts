import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Effect } from "effect";
import { PingCommand } from "./commands/ping.ts";
import type { DiscordCommand } from "./commands/type.ts";
import { commandHandler } from "./lib/handler.ts";

export class Bot extends Client {
  public commands: DiscordCommand[] = [PingCommand];
}

export const client = new Bot({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [
    Partials.Channel,
    Partials.Reaction,
    Partials.Message,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.User,
  ],
});

client.on("ready", (c) => {
  Effect.runFork(Effect.log(`Bot is logged in as ${c.user.tag}`));
});

client.on("messageCreate", async (message) => {
  const resp = await Effect.runPromise(
    commandHandler(client.commands)(message),
  ).catch((_) => {});

  if (resp) {
    await message.channel.send(resp);
  }
});

client.on("interactionCreate", async (interaction) => {
  const resp = await Effect.runPromise(
    commandHandler(client.commands)(interaction),
  ).catch((_) => {});
  if (resp && interaction.isRepliable()) {
    interaction.editReply(resp);
  }
});
