import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import { Effect } from "effect";
import { PingCommand } from "./commands/ping.ts";
import { SubmitCommand } from "./commands/submit.ts";
import type { DiscordCommand } from "./commands/type.ts";
import { commandHandler } from "./lib/handler.ts";

export class Bot extends Client {
  public commands: DiscordCommand[] = [PingCommand, SubmitCommand];
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

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const resp = await Effect.runPromise(
    commandHandler(client.commands)(interaction),
  ).catch((_) => {});
  if (resp && interaction.isRepliable()) {
    interaction.editReply(resp);
  }
});
