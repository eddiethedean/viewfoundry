import { describe, expect, it } from 'vitest';
import { createDocument, createHistory, createNode, pushHistory } from '@viewfoundry/core';
import { documentTreeEqual, isStaleInboundDocument } from './sync-utils.js';

describe('documentTreeEqual', () => {
  it('ignores version-only changes', () => {
    const a = createDocument({ version: '0.1' });
    const b = createDocument({ version: '0.2' as '0.1' });
    expect(documentTreeEqual(a, b)).toBe(true);
  });
});

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

  it('allows revert to an older snapshot not matching immediate prior only', () => {
    const empty = createDocument();
    const withButton = createDocument();
    withButton.root.children = [createNode('Button', {}, [], 'btn1')];
    const withCard = createDocument();
    withCard.root.children = [createNode('Card', {}, [], 'card1')];

    let history = createHistory(empty);
    history = pushHistory(history, withButton);
    history = pushHistory(history, withCard);

    expect(isStaleInboundDocument(empty, withCard, history)).toBe(false);
  });
});
