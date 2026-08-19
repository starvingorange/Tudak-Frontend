// Hand-maintained helper for src/api/{domain}/hooks — no longer generated,
// react-query hooks are written manually against api/ and types/ output.
export type SecondParameter<T extends (...args: never) => unknown> =
  Parameters<T>[1];
