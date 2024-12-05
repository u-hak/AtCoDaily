import { REST, Routes } from "discord.js";
import { Console, Effect, Schedule } from "effect";
import { type Bot, client } from "./client.ts";
import { sendProblems } from "./lib/bot.ts";
import { PrismaRepositoryLive } from "./lib/reposiory/prisma.ts";
import {
  ProblemService,
  ProblemServiceLive,
} from "./lib/reposiory/service/Problem.ts";
import {
  ProblemRevisionService,
  ProblemRevisionServiceLive,
} from "./lib/reposiory/service/ProblemRevision.ts";
import { getEnv } from "./utils.ts";

const botSystem = (client: Bot) =>
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

const problemSystem = (client: Bot) =>
  Effect.repeat(
    Effect.gen(function* () {
      yield* Effect.log("Problem System running...");
      const date = new Date();
      yield* Effect.log(
        `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      );
      yield* Effect.Do.pipe(
        Effect.bindAll(() => ({
          problemRepo: Effect.gen(function* () {
            return yield* ProblemService;
          }),
          problemRevisionRepo: Effect.gen(function* () {
            return yield* ProblemRevisionService;
          }),
        })),
        Effect.bind("problems", ({ problemRepo }) =>
          problemRepo.getTodayProblem(),
        ),
        Effect.tap(({ problems, problemRevisionRepo }) =>
          problemRevisionRepo.createRevision(new Date(), problems),
        ),
        Effect.tap(({ problems }) => sendProblems(client, problems)),
      ).pipe(
        Effect.provide(ProblemServiceLive),
        Effect.provide(ProblemRevisionServiceLive),
        Effect.provide(PrismaRepositoryLive),
        Effect.catchAll((e) => {
          Console.error(e);
          return Effect.succeed(e);
        }),
      );
    }),
    Schedule.fixed("10 seconds"),
  );

Effect.runPromise(Effect.all([botSystem(client), problemSystem(client)])).catch(
  console.error,
);
