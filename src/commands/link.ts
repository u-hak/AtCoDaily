import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Effect } from "effect";
import { DummyRepositoryLive } from "../lib/reposiory/dummy.ts";
import { PrismaRepositoryLive } from "../lib/reposiory/prisma.ts";
import {
  AccountService,
  AccountServiceLive,
} from "../lib/reposiory/service/Account.ts";
import { CommandInternalError, type DiscordCommand } from "./type.ts";

const embed = (atcoderId: string, discordId: string) =>
  new EmbedBuilder()
    .setTitle("連携完了")
    .setDescription("アカウント連携が完了しました！")
    .addFields(
      {
        name: "AtCoder ID",
        value: atcoderId,
        inline: true,
      },
      {
        name: "Discord ID",
        value: discordId,
        inline: true,
      },
    )
    .setColor("#00b0f4");

export const LinkCommand: DiscordCommand = {
  name: "link",
  slashCommand: new SlashCommandBuilder()
    .setName("link")
    .setNameLocalization("ja", "連携")
    .setDescription("AtCoderとDiscordのアカウントを紐づけます")
    .addStringOption((o) =>
      o
        .setName("atcoderid")
        .setDescription("AtCoderのアカウントID")
        .setRequired(true),
    ),
  execute: (input) =>
    Effect.Do.pipe(
      Effect.let("atcoderId", () => input.options.getString("atcoderid", true)),
      Effect.let("discordUser", () => input.user),
      Effect.bind("AccountService", () => AccountService),
      Effect.provide(AccountServiceLive),
      // Effect.provide(DummyRepositoryLive),
      Effect.provide(PrismaRepositoryLive),
      Effect.tap(({ atcoderId, discordUser, AccountService }) =>
        AccountService.create({
          data: {
            atcoderId,
            discordId: discordUser.id,
          },
        }),
      ),
      Effect.catchTags({
        AccountAlreadyCreated: (_) =>
          new CommandInternalError({
            name: LinkCommand.name,
            cause: "Discordアカウントが既にAtCoderと連携済です",
          }),
        RepositoryException: (e) =>
          new CommandInternalError({ name: LinkCommand.name, cause: e }),
      }),
      Effect.map(({ atcoderId, discordUser }) => ({
        embeds: [embed(atcoderId, discordUser.displayName)],
      })),
    ),
};
