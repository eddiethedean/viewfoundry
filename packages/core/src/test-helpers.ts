import { expect } from 'vitest';
import type { CommandResult, ViewDocument } from './types.js';

export function expectCommandFailure(result: CommandResult, errorSubstring: string): void {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error).toContain(errorSubstring);
  }
}

export function expectDocumentUnchanged(
  before: ViewDocument,
  run: () => CommandResult,
): CommandResult {
  const snapshot = structuredClone(before);
  const result = run();
  expect(before).toEqual(snapshot);
  return result;
}
