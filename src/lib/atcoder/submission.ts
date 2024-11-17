import { FetchHttpClient, HttpClient } from "@effect/platform";
import { Effect } from "effect";
import { type HTMLElement, parse } from "node-html-parser";
import { ElementNotFound, UnknownSubmissionStatus } from "./error.ts";
import { AtCoderSubmission, AtCoderTask, AtCoderUser } from "./type.ts";

const fetchSubmissionPageText = (url: string) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;
    const response = yield* client.get(url);
    return yield* response.text;
  }).pipe(Effect.scoped, Effect.provide(FetchHttpClient.layer));

const parseHtml = (text: string) => Effect.succeed(parse(text));

const extract =
  (query: string) =>
  <T, E>(
    root: HTMLElement,
    transformer: (elem: HTMLElement) => Effect.Effect<T, E>,
  ) =>
    Effect.gen(function* () {
      const elem = root.querySelector(query);

      if (!elem) {
        return yield* new ElementNotFound();
      }

      return yield* transformer(elem);
    });

const DateQuery =
  "#main-container > div.row > div > div.panel > table tr:nth-child(1)";
const TaskQuery =
  "#main-container > div.row > div > div.panel > table tr:nth-child(2) a";
const StatusQuery = "#judge-status > span";
const UserQuery =
  "#main-container > div.row > div > div.panel > table tr:nth-child(3) a";

export const DateTransformer = (e: HTMLElement) =>
  Effect.succeed(new Date(Date.parse(e.text)));
export const TaskTransformer = (e: HTMLElement) =>
  Effect.gen(function* () {
    const href = e.getAttribute("href");
    if (!href) {
      return yield* new ElementNotFound();
    }

    const id = href.split("/").slice(-1)[0];
    const [difficulty, name] = e.textContent.split(" - ");

    return yield* Effect.succeed(
      AtCoderTask.new({
        difficulty,
        id,
        name,
      }),
    );
  });
export const StatusTransformer = (
  e: HTMLElement,
): Effect.Effect<AtCoderSubmission["status"], UnknownSubmissionStatus> =>
  Effect.gen(function* () {
    const status = e.innerText;
    if (!["RE", "TLE", "WA", "AC"].includes(status.toUpperCase())) {
      return yield* new UnknownSubmissionStatus();
    }

    return yield* Effect.succeed(status as AtCoderSubmission["status"]);
  });
const UserTransformer = (e: HTMLElement) =>
  Effect.succeed(AtCoderUser.fromString(e.innerText));

const extractData = (root: HTMLElement) =>
  Effect.all(
    [
      extract(DateQuery)(root, DateTransformer),
      extract(TaskQuery)(root, TaskTransformer),
      extract(StatusQuery)(root, StatusTransformer),
      extract(UserQuery)(root, UserTransformer),
    ],
    {
      concurrency: "unbounded",
    },
  ).pipe(
    Effect.andThen(([date, task, status, user]) =>
      AtCoderSubmission.new({ date, task, status, user }),
    ),
  );

export const scrapeSubmission = (url: string) =>
  Effect.gen(function* () {
    const text = yield* fetchSubmissionPageText(url);
    const root = yield* parseHtml(text);

    return yield* extractData(root);
  });
