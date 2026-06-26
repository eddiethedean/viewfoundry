#!/usr/bin/env node
/**
 * Copy specs/PACKAGE_API_SPEC.md into apps/docs for Read the Docs.
 * Run automatically from scripts/build-docs.mjs; also: node scripts/sync-api-spec.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'specs/PACKAGE_API_SPEC.md');
const target = join(root, 'apps/docs/package-api-spec.md');

const content = readFileSync(source, 'utf-8');
const header = `<!-- Generated from specs/PACKAGE_API_SPEC.md — run node scripts/sync-api-spec.mjs -->\n\n`;
writeFileSync(target, header + content);
console.log('Synced specs/PACKAGE_API_SPEC.md → apps/docs/package-api-spec.md');
