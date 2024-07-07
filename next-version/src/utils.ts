import { error } from "@actions/core";

/**
 * A wrapper for `error` from `@actions/core` which logs recursively,
 * and logs both the error message and stack trace if it exists.
 */
// TODO: Is this neccesary? Does `error` still not log recursively?
export function errorRecursive(e: unknown): void {
  if (e instanceof Error) {
    if (e.cause) {
      errorRecursive(e.cause);
    } else {
      error(e.stack ?? e.message);
    }
  } else {
    error(e as string);
  }
}
