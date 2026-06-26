import { describe, expect, it } from 'vitest';
import { createDocument, createHistory, createNode, pushHistory } from '@viewfoundry/core';
import { isStaleInboundDocument } from './sync-utils.js';

describe('isStaleInboundDocument', () => {
  it('detects parent lag when inbound matches history past', () => {
    const empty = createDocument();
    const withButton = createDocument();
    withButton.root.children = [createNode('Button', {}, [], 'btn1')];

    let history = createHistory(empty);
    history = pushHistory(history, withButton);

    expect(isStaleInboundDocument(empty, withButton, history)).toBe(true);
    expect(isStaleInboundDocument(withButton, withButton, history)).toBe(false);
  });
});
