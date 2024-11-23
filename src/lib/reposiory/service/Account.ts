import type { Account, Prisma } from "@prisma/client";
import { Context, Effect, Layer } from "effect";
import {
  type AccountAlreadyCreated,
  type AccountNotFound,
  Repository,
  type RepositoryException,
} from "../interface.ts";

type AccountService = {
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

export const AccountService =
  Context.GenericTag<AccountService>("AccountService");

const serviceGeneration = Effect.gen(function* () {
  const { account: accountRepository } = yield* Repository;

  return {
    create: (data: Prisma.AccountCreateArgs) => accountRepository.create(data),
    getByDiscordId: (id: string) => accountRepository.getByDiscordId(id),
    getByAtcoderId: (id: string) => accountRepository.getByAtcoderId(id),
  };
});

export const AccountServiceLive = Layer.effect(
  AccountService,
  serviceGeneration,
);
