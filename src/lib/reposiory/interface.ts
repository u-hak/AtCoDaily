import type { Problem, ProblemRevision } from "@prisma/client";
import { Context, Data, type Effect } from "effect";

export type Repository = {
  problem: {
    getTodayProblem: () => Effect.Effect<Problem[], RepositoryException>;
  };
  problemRevision: {
    createRevision: (
      date: Date,
      problems: Problem[],
    ) => Effect.Effect<void, RepositoryException>;
    getRevision: (
      date: Date,
    ) => Effect.Effect<ProblemRevision, RepositoryException>;
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
