import { Prisma, PrismaClient } from "@prisma/client";
import { Context, Effect, Layer } from "effect";
import {
  AccountAlreadyCreated,
  AccountNotFound,
  Repository,
  RepositoryException,
} from "./interface.ts";

const prisma = new PrismaClient();

const PrismaRepositoryContext: Context.Context<Repository> = Context.make(
  Repository,
  {
    account: {
      create: (data) =>
        Effect.tryPromise({
          try: () => prisma.account.create(data),
          catch: (e) => {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
              if (e.code === "P2002") {
                return new AccountAlreadyCreated({ cause: e });
              }
            }
            return new RepositoryException({ cause: e });
          },
        }),
      getByDiscordId: (id) =>
        Effect.tryPromise({
          try: () =>
            prisma.account.findUnique({
              where: {
                discordId: id,
              },
            }),
          catch: (e) => new RepositoryException({ cause: e }),
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
          catch: (e) => new RepositoryException({ cause: e }),
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
