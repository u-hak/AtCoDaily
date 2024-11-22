import type { Account, Prisma } from "@prisma/client";
import { Context, Data, type Effect } from "effect";

export type Repository = {
  account: {
    create: (data: Prisma.AccountCreateArgs) => Effect.Effect<Account, Error>;
    getByDiscordId: (
      id: string,
    ) => Effect.Effect<Account, Error | AccountNotFound>;
    getByAtcoderId: (
      id: string,
    ) => Effect.Effect<Account, Error | AccountNotFound>;
  };
};

export const Repository = Context.GenericTag<Repository>("Repository");

export class AccountNotFound extends Data.TaggedError("AccountNotFound") {}
