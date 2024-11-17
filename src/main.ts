import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Effect } from "effect";

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

client.on("ready", (c) => {
  console.log(`Bot is logged in as ${c.user.tag}`);
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

const login = (token: string) => Effect.tryPromise(() => client.login(token));

const main = Effect.gen(function* () {
  const token = yield* getToken();
  return yield* login(token);
});

Effect.runPromise(main);
