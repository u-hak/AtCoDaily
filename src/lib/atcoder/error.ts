import { Data } from "effect";

export class UnknownSubmissionStatus extends Data.TaggedError(
  "UnknownSubmissionStatus",
) {}

export class ElementNotFound extends Data.TaggedError("ElementNotFound") {}

export class SubmissionPageFetchFailed extends Data.TaggedError(
  "SubmissionPageFetchFailed",
) {}
