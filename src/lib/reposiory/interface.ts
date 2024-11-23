import type { Account, Prisma } from "@prisma/client";
import { Context, Data, type Effect } from "effect";

export type Repository = {
  account: {
    create: (
      data: Prisma.AccountCreateArgs,
    ) => Effect.Effect<Account, AccountAlreadyCreated | RepositoryException>;
    getByDiscordId: (
      id: string,
    ) => Effect.Effect<Account, AccountNotFound | RepositoryException>;
    getByAtcoderId: (
      id: string,
    ) => Effect.Effect<Account, AccountNotFound | RepositoryException>;
  };
};

export const Repository = Context.GenericTag<Repository>("Repository");

export class AccountNotFound extends Data.TaggedError("AccountNotFound") {}
export class AccountAlreadyCreated extends Data.TaggedError(
  "AccountAlreadyCreated",
)<{ cause: unknown }> {}

export class RepositoryException extends Data.TaggedError(
  "RepositoryException",
)<{ cause: unknown }> {}
