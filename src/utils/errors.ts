export class DomainError extends Error {
  readonly name = `DomainError`;
}

export class ValidationError extends Error {
  readonly name = `ValidationError`;

  constructor(public errors: string[]) {
    super(`Invalid Request`);
  }
}
