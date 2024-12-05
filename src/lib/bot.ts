import type { Problem } from "@prisma/client";
import { Effect } from "effect";
import type { Bot } from "../client.ts";

const GUILD_ID = "1307369288654393558";

export const sendProblems = (bot: Bot, problems: Problem[]) =>
  Effect.gen(function* () {
    const channel = yield* Effect.tryPromise({
      try: () => getChannel(bot),
      catch: (e) => e,
    });
    const urls = problems.map((p) => p.url);
    channel.send(urls.join("\n"));
  });

const getChannel = async (bot: Bot) => {
  try {
    const guild = await bot.guilds.fetch(GUILD_ID);
    const channel = guild.channels.cache.find((c) => c.name === "問題");
    if (!channel || !channel.isSendable()) {
      throw new Error();
    }
    return channel;
  } catch (e) {
    throw new Error();
  }
};
