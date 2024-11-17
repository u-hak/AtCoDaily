export class UnknownSubmissionStatus extends Error {}
export class ElementNotFound extends Error {}

export class SubmissionPageFetchFailed extends Error {
  constructor(url: string) {
    super(`\`${url}\` may be invalid URL`);
  }
}
