import type { Problem } from "@prisma/client";
import { Context, Effect, Layer } from "effect";
import { Repository, type RepositoryException } from "../interface.ts";

type ProblemService = {
  getTodayProblem: () => Effect.Effect<Problem[], RepositoryException>;
};

export const ProblemService =
  Context.GenericTag<ProblemService>("ProblemService");

const serviceGeneration = Effect.gen(function* () {
  const { problem: problemRepository } = yield* Repository;
  return {
    getTodayProblem: () => problemRepository.getTodayProblem(),
  };
});

export const ProblemServiceLive = Layer.effect(
  ProblemService,
  serviceGeneration,
);
