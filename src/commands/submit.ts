import { SlashCommandBuilder } from "discord.js";
import { Effect } from "effect";
import { scrapeSubmission } from "../lib/atcoder/submission.ts";
import {
  CommandInternalError,
  type DiscordCommand,
  type DiscordInput,
} from "./type.ts";

export const SubmitCommand: DiscordCommand = {
  name: "submit",
  slashCommand: new SlashCommandBuilder()
    .setName("submit")
    .setDescription("Submitコマンド"),
  execute: (di: DiscordInput) =>
    Effect.Do.pipe(
      Effect.bind("url", () =>
        Effect.try({
          try: () => di.args[0],
          catch: (_) =>
            new CommandInternalError(di, "Arg `url` is not found, but require"),
        }),
      ),
      Effect.bind("submission", ({ url }) => scrapeSubmission(url)),
      Effect.mapError((e) => new CommandInternalError(di, e.name)),
      Effect.flatMap(({ submission }) =>
        Effect.succeed({
          content: `Task: ${submission.task.difficulty} - ${submission.task.name}
Status: ${submission.status}
Time: ${submission.date}
Submit by ${submission.user.name}
`,
        }),
      ),
    ),
};
