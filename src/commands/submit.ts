import { SlashCommandBuilder } from "discord.js";
import { Effect } from "effect";
import { scrapeSubmission } from "../lib/atcoder/submission.ts";
import { CommandInternalError, type DiscordCommand } from "./type.ts";

export const SubmitCommand: DiscordCommand = {
  name: "submit",
  slashCommand: new SlashCommandBuilder()
    .setName("submit")
    .setDescription("Submitコマンド")
    .addStringOption((o) =>
      o.setName("url").setDescription("提出URL").setRequired(true),
    ),
  execute: (input) =>
    Effect.Do.pipe(
      Effect.let("url", () => input.options.getString("url", true)),
      Effect.bind("submission", ({ url }) => scrapeSubmission(url)),
      Effect.mapError(
        (e) => new CommandInternalError(SubmitCommand.name, e.toString()),
      ),
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
