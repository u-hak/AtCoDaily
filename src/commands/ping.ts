import { Effect } from "effect";
import type { DiscordCommand, DiscordInput } from "./type.ts";

export const PingCommand: DiscordCommand = {
  name: "ping",
  execute: (_: DiscordInput) => {
    return Effect.succeed({
      content: "pong!",
    });
  },
};
