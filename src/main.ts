import { REST, Routes } from "discord.js";
import { Effect } from "effect";
import { type Bot, client } from "./client.ts";
import { getEnv } from "./utils.ts";

const main = (client: Bot) =>
  Effect.Do.pipe(
    Effect.bindAll(
      () => ({
        token: getEnv("DISCORD_TOKEN"),
        applicationId: getEnv("DISCORD_APPLICATION_ID"),
      }),
      { concurrency: 2 },
    ),
    Effect.let("rest", ({ token }) =>
      new REST({ version: "10" }).setToken(token),
    ),
    Effect.tap(({ rest, applicationId }) =>
      Effect.tryPromise(() =>
        rest.put(Routes.applicationCommands(applicationId), {
          body: client.commands.map((c) => c.slashCommand),
        }),
      ),
    ),
    Effect.tap(({ token }) => Effect.tryPromise(() => client.login(token))),
  );

Effect.runPromise(main(client));
