import { Context, Effect, Layer } from "effect";
import { Repository } from "./interface.ts";

const DummyRepositoryContext: Context.Context<Repository> = Context.make(
  Repository,
  {
    account: {
      create: (data) => Effect.succeed(data.data),
      getByDiscordId: (id) =>
        Effect.succeed({
          discordId: id,
          atcoderId: "dummy",
        }),
      getByAtcoderId: (id) =>
        Effect.succeed({
          discordId: "dummy",
          atcoderId: id,
        }),
    },
  },
);

export const DummyRepositoryLive = Layer.succeedContext(DummyRepositoryContext);
