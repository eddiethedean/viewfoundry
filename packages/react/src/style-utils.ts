import type { CSSProperties } from 'react';
import type { StyleTokenMap } from '@viewfoundry/core';
import { resolveStyleValue } from '@viewfoundry/core';

export function resolveStyleMap(
  style: StyleTokenMap | undefined,
  tokens?: Record<string, string | number>,
): CSSProperties {
  if (!style) return {};

  const result: CSSProperties = {};
  for (const [key, value] of Object.entries(style)) {
    const resolved = resolveStyleValue(value, tokens);
    (result as Record<string, string | number>)[key] = resolved;
  }
  return result;
}

export function mergeStyles(...sources: Array<CSSProperties | undefined>): CSSProperties {
  const merged: CSSProperties = {};
  for (const source of sources) {
    if (!source) continue;
    Object.assign(merged, source);
  }
  return merged;
}
