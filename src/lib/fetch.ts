import { type TaskEither, tryCatch } from "fp-ts/lib/TaskEither.js";

export const get = <E extends Error>(
  url: string,
  error: E,
): TaskEither<E, Response> =>
  tryCatch(
    () => fetch(url),
    (_) => error,
  );

class ResponseTextFailed extends Error {}
export const text = (res: Response): TaskEither<ResponseTextFailed, string> =>
  tryCatch(
    () => res.text(),
    (_) => new ResponseTextFailed(),
  );
