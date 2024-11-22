import type { Account, Prisma } from "@prisma/client";
import { Context, Effect, Layer } from "effect";
import { Repository } from "../../interface.ts";

type AccountCreate = (
  data: Prisma.AccountCreateArgs,
) => Effect.Effect<Account, Error>;

const AccountCreate = Context.GenericTag<AccountCreate>("AccountCreate");

const serviceGeneration: Effect.Effect<AccountCreate, never, Repository> =
  Effect.gen(function* () {
    const repository = yield* Repository;
    return (data: Prisma.AccountCreateArgs) =>
      Effect.gen(function* () {
        return yield* repository.account.create(data);
      });
  });

export const AccountCreateLive = Layer.effect(AccountCreate, serviceGeneration);
