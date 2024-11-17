import * as RArr from "fp-ts/lib/ReadonlyArray.js";
import * as Task from "fp-ts/lib/Task.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";

export function lift<E, A>(a: TE.TaskEither<E, A>) {
  return pipe(
    a,
    TE.mapLeft((e): ReadonlyArray<E> => [e]),
  );
}

export const getValidation = <T>() => {
  return TE.getApplicativeTaskValidation(Task.ApplyPar, RArr.getSemigroup<T>());
};
