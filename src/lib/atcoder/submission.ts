import { sequenceT } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type HTMLElement, parse } from "node-html-parser";
import { get, text } from "../fetch.ts";
import { getValidation, lift } from "../taskValidation.ts";
import {
  ElementNotFound,
  SubmissionPageFetchFailed,
  UnknownSubmissionStatus,
} from "./error.ts";
import { AtCoderSubmission, AtCoderTask } from "./type.ts";

export const isValidSubmissionStatusExpr = (
  expr: unknown,
): expr is AtCoderSubmission["status"] => {
  if (
    typeof expr === "string" &&
    ["RE", "TLE", "WA", "AC"].includes(expr.toUpperCase())
  ) {
    return true;
  }
  return false;
};

export const extractDate = (
  root: HTMLElement,
): TE.TaskEither<ElementNotFound, Date> => {
  const query =
    "#main-container > div.row > div > div.panel > table tr:nth-child(1)";
  const elem = root.querySelector(query);

  if (elem) {
    return TE.right(new Date(Date.parse(elem.text)));
  }
  return TE.left(new ElementNotFound(`searched ${query}, but not found`));
};

export const extractTask = (
  root: HTMLElement,
): TE.TaskEither<ElementNotFound, AtCoderTask> => {
  const query =
    "#main-container > div.row > div > div.panel > table tr:nth-child(2) a";
  const taskElem = root.querySelector(query);
  const href = taskElem?.getAttribute("href");

  if (taskElem && href) {
    const id = href.split("/").slice(-1)[0];
    const [difficulty, name] = taskElem.textContent.split(" - ");
    return TE.right(
      AtCoderTask.new({
        difficulty,
        id,
        name,
      }),
    );
  }
  return TE.left(new ElementNotFound(`searched ${query}, but not found`));
};

export const extractStatus = (
  root: HTMLElement,
): TE.TaskEither<
  ElementNotFound | UnknownSubmissionStatus,
  AtCoderSubmission["status"]
> => {
  const query = "#judge-status > span";
  const statusElem = root.querySelector(query);
  if (statusElem) {
    const status = statusElem.innerText;
    if (isValidSubmissionStatusExpr(status)) {
      return TE.right(status);
    }

    return TE.left(
      new UnknownSubmissionStatus(`want RE, TLE, WA, AC but got ${status}`),
    );
  }

  return TE.left(new ElementNotFound(`searched ${query}, but not found`));
};

export const scrapeSubmission = (url: string) => {
  return pipe(
    TE.Do,
    TE.bindW("page", () =>
      get(url, new SubmissionPageFetchFailed(`\`${url}\` may be invalid URL`)),
    ),
    TE.bindW("text", ({ page }) => text(page)),
    TE.let("root", ({ text }) => parse(text)),
    TE.bindW("data", ({ root }) =>
      sequenceT(getValidation())(
        lift(extractDate(root)),
        lift(extractTask(root)),
        lift(extractStatus(root)),
      ),
    ),
    TE.map(({ data }) => AtCoderSubmission.fromSeq(data)),
    TE.mapLeft((e) => e),
  );
};
