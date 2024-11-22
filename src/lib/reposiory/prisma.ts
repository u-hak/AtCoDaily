import { PrismaClient } from "@prisma/client";
import { Context, Effect, Layer } from "effect";
import { AccountNotFound, Repository } from "./interface.ts";

const prisma = new PrismaClient();

const PrismaRepositoryContext: Context.Context<Repository> = Context.make(
  Repository,
  {
    account: {
      create: (data) =>
        Effect.tryPromise({
          try: () => prisma.account.create(data),
          catch: (e) =>
            e instanceof Error ? e : new Error(`account.create error ${e}`),
        }),
      getByDiscordId: (id) =>
        Effect.tryPromise({
          try: () =>
            prisma.account.findUnique({
              where: {
                discordId: id,
              },
            }),
          catch: (e) =>
            e instanceof Error
              ? e
              : new Error(`account.getByDiscordId error ${e}`),
        }).pipe(
          Effect.flatMap((acct) =>
            acct !== null
              ? Effect.succeed(acct)
              : Effect.fail(new AccountNotFound()),
          ),
        ),
      getByAtcoderId: (id) =>
        Effect.tryPromise({
          try: () =>
            prisma.account.findUnique({
              where: {
                atcoderId: id,
              },
            }),
          catch: (e) =>
            e instanceof Error
              ? e
              : new Error(`account.getByDiscordId error ${e}`),
        }).pipe(
          Effect.flatMap((acct) =>
            acct !== null
              ? Effect.succeed(acct)
              : Effect.fail(new AccountNotFound()),
          ),
        ),
    },
  },
);

export const PrismaRepositoryLive = Layer.succeedContext(
  PrismaRepositoryContext,
);
