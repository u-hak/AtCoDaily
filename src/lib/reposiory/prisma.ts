import { PrismaClient } from "@prisma/client";
import { Context, Effect, Layer } from "effect";
import { Repository, RepositoryException } from "./interface.ts";

const prisma = new PrismaClient();

const PrismaRepositoryContext: Context.Context<Repository> = Context.make(
  Repository,
  {
    problem: {
      getTodayProblem: () =>
        Effect.gen(function* () {
          const count = yield* Effect.tryPromise({
            try: () => prisma.problem.count(),
            catch: (e) => new RepositoryException({ cause: e }),
          });
          const problems = [];
          for (const i of [0, 1, 2]) {
            const skip = Math.floor((count / 3) * Math.random());
            const prob = yield* Effect.tryPromise({
              try: () =>
                prisma.problem.findMany({
                  where: {
                    difficulty: i,
                  },
                  orderBy: {
                    times: "asc",
                  },
                  take: 1,
                  skip: skip,
                }),
              catch: (e) => new RepositoryException({ cause: e }),
            });
            problems.push(prob[0]);
          }

          return problems;
        }),
    },
    problemRevision: {
      createRevision: (date, problem) =>
        Effect.gen(function* () {
          const ids = problem.map((v) => ({ id: v.id }));
          return yield* Effect.tryPromise({
            try: () =>
              prisma.problemRevision.create({
                data: {
                  date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`,
                  problems: {
                    connect: ids,
                  },
                },
              }),
            catch: (e) => new RepositoryException({ cause: e }),
          });
        }),
      getRevision: (date) =>
        Effect.gen(function* () {
          return yield* Effect.tryPromise({
            try: () =>
              prisma.problemRevision.findUniqueOrThrow({
                where: {
                  date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`,
                },
                include: {
                  problems: true,
                },
              }),
            catch: (e) => new RepositoryException({ cause: e }),
          });
        }),
    },
  },
);

export const PrismaRepositoryLive = Layer.succeedContext(
  PrismaRepositoryContext,
);
