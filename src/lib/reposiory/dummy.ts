import { Context, Effect, Layer } from "effect";
import { Repository } from "./interface.ts";

const DummyRepositoryContext: Context.Context<Repository> = Context.make(
  Repository,
  {
    problem: {
      getTodayProblem: () =>
        Effect.succeed([
          {
            id: "abc000_a",
            url: "https://atcoder.jp/contests/abc000/tasks/abc000_a",
            difficulty: 0,
            times: 0,
            submit: [],
            revision: [],
          },
          {
            id: "abc000_b",
            url: "https://atcoder.jp/contests/abc000/tasks/abc000_b",
            difficulty: 1,
            times: 0,
            submit: [],
            revision: [],
          },
          {
            id: "abc000_c",
            url: "https://atcoder.jp/contests/abc000/tasks/abc000_c",
            difficulty: 2,
            times: 0,
            submit: [],
            revision: [],
          },
        ]),
    },
    problemRevision: {
      getRevision: (date) =>
        Effect.succeed({
          date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        }),
      createRevision: (_date, _problems) => Effect.succeed(undefined),
    },
  },
);

export const DummyRepositoryLive = Layer.succeedContext(DummyRepositoryContext);
