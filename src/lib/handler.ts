import { FileSystem } from "@effect/platform";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Effect } from "effect";

const importCommand = (path: string) =>
  Effect.gen(function* () {
    Effect.tryPromise(() => import(path));
  });

export const loadCommands = (dir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const cmdFiles = yield* fs.readDirectory(dir);

    return yield* Effect.partition(cmdFiles, (cmdFile) => {
      return importCommand(cmdFile);
    });
  }).pipe(Effect.provide(NodeContext.layer));

export const registerCommands = () => {};

export const handleCommands = () => {};

Effect.runPromise(loadCommands("./src/commands")).then(console.log);
