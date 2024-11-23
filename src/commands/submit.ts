import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Effect } from "effect";
import { scrapeSubmission } from "../lib/atcoder/submission.ts";
import type { AtCoderSubmission } from "../lib/atcoder/type.ts";
import { CommandInternalError, type DiscordCommand } from "./type.ts";

const emoji: Record<AtCoderSubmission["status"], string> = {
  AC: "<:ac:1309547498775511120>",
  WA: "<:wa:1309547506857672724>",
  RE: "<:re:1309547502940196934>",
  TLE: "<:tle:1309547504995667968>",
  CE: "<:ce:1309547500864147496>",
};

const embed = (submission: AtCoderSubmission, url: string) =>
  new EmbedBuilder()
    .setAuthor({
      name: "提出結果",
    })
    .setTitle(`${submission.task.difficulty} - ${submission.task.name}`)
    .setURL(url)
    .addFields(
      {
        name: "提出者",
        value: submission.user.name,
        inline: true,
      },
      {
        name: "状態",
        value: `${emoji[submission.status]}`,
        inline: true,
      },
      {
        name: "提出時刻",
        value: submission.date.toLocaleString("ja-JP"),
        inline: true,
      },
    )
    .setColor(submission.status === "AC" ? "#5CB85C" : "#f0ad4e");

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
        (e) => new CommandInternalError({ name: SubmitCommand.name, cause: e }),
      ),
      Effect.flatMap(({ submission, url }) =>
        Effect.succeed({
          embeds: [embed(submission, url)],
        }),
      ),
    ),
};
