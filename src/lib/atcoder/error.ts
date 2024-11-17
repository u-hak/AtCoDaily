export class UnknownSubmissionStatus extends Error {}
export class ElementNotFound extends Error {
  constructor(query: string) {
    super(`searched ${query}, but not found`);
  }
}

export class SubmissionPageFetchFailed extends Error {
  constructor(url: string) {
    super(`\`${url}\` may be invalid URL`);
  }
}
