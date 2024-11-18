import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Console, Effect } from "effect";
import { PingCommand } from "./commands/ping.ts";
import {
  commandHandler,
  generateDiscordInput,
  handleDiscordInput,
} from "./lib/handler.ts";

const client = new Client({
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

const cmdHandler = commandHandler([PingCommand]);

client.on("ready", (c) => {
  console.log(`Bot is logged in as ${c.user.tag}`);
});

client.on("messageCreate", async (message) => {
  const resp = await Effect.runPromise(cmdHandler(message)).catch((_) => {});

  if (resp) {
    await message.channel.send(resp);
  }
});

client.on("interactionCreate", async (interaction) => {
  const resp = await Effect.runPromise(cmdHandler(interaction)).catch(
    (_) => {},
  );
  console.log(resp);
});

const getToken = () =>
  Effect.gen(function* () {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      return yield* Effect.fail(
        new Error("DISCORD_TOKEN is not setting in env. vars"),
      );
    }
    return yield* Effect.succeed(token);
  });

const main = Effect.Do.pipe(Effect.bind("token", () => getToken())).pipe(
  Effect.andThen(({ token }) => Effect.tryPromise(() => client.login(token))),
);

Effect.runPromise(main);
