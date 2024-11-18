import { Effect } from "effect";

export const getEnv = (key: string) =>
  Effect.gen(function* () {
    const val = process.env[key];
    if (!val) {
      return yield* Effect.fail(
        new Error(`${key} is not setting in env. vars`),
      );
    }
    return yield* Effect.succeed(val);
  });
