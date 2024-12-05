import type { Problem, ProblemRevision } from "@prisma/client";
import { Context, Effect, Layer } from "effect";
import { Repository, type RepositoryException } from "../interface.ts";

type ProblemRevisionService = {
  createRevision: (
    date: Date,
    problems: Problem[],
  ) => Effect.Effect<void, RepositoryException>;
  getRevision: (
    date: Date,
  ) => Effect.Effect<ProblemRevision, RepositoryException>;
};

export const ProblemRevisionService =
  Context.GenericTag<ProblemRevisionService>("ProblemRevision");

const serviceGen = Effect.gen(function* () {
  const { problemRevision: problemRevisionService } = yield* Repository;
  return {
    createRevision: (date: Date, problems: Problem[]) =>
      problemRevisionService.createRevision(date, problems),
    getRevision: (date: Date) => problemRevisionService.getRevision(date),
  };
});

export const ProblemRevisionServiceLive = Layer.effect(
  ProblemRevisionService,
  serviceGen,
);
