import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDocument, createNode } from '@viewfoundry/core';
import { loadDocument, printHelp, runCli } from './cli.js';

describe('runCli', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    tempDirs.length = 0;
    vi.restoreAllMocks();
  });

  function makeTempDir() {
    const dir = mkdtempSync(join(tmpdir(), 'viewfoundry-cli-'));
    tempDirs.push(dir);
    return dir;
  }

  function writeFixture(name: string, document: ReturnType<typeof createDocument>) {
    const dir = makeTempDir();
    const path = join(dir, name);
    writeFileSync(path, JSON.stringify(document, null, 2));
    return path;
  }

  it('prints help', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = runCli(['--help']);
    expect(result.exitCode).toBe(0);
    expect(log).toHaveBeenCalled();
    printHelp();
  });

  it('exports TSX from a valid document', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hi' }, [], 'b1')];
    const inputPath = writeFixture('doc.json', doc);
    const outputPath = join(makeTempDir(), 'GeneratedView.tsx');

    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = runCli(['export', inputPath, outputPath]);

    expect(result.exitCode).toBe(0);
    expect(readFileSync(outputPath, 'utf-8')).toContain('export function GeneratedView()');
    expect(log).toHaveBeenCalledWith(`Wrote ${outputPath}`);
  });

  it('errors when export input path is missing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = runCli(['export']);
    expect(result.exitCode).toBe(1);
    expect(error).toHaveBeenCalledWith('Error: input JSON path required');
  });

  it('validates a valid document', () => {
    const inputPath = writeFixture('doc.json', createDocument());
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = runCli(['validate', inputPath]);
    expect(result.exitCode).toBe(0);
    expect(log).toHaveBeenCalledWith('Valid ViewFoundry document');
    expect(loadDocument(inputPath).version).toBe('0.1');
  });

  it('fails validation for invalid version', () => {
    const doc = createDocument({ version: '99.0' as '0.1' });
    const inputPath = writeFixture('bad.json', doc);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = runCli(['validate', inputPath]);
    expect(result.exitCode).toBe(1);
    expect(error).toHaveBeenCalledWith('Invalid ViewFoundry document:');
  });

  it('fails validation for duplicate node ids', () => {
    const doc = createDocument();
    const child = createNode('Button', { children: 'Hi' }, [], 'dup');
    doc.root.children = [child, { ...child }];
    const inputPath = writeFixture('dup.json', doc);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = runCli(['validate', inputPath]);
    expect(result.exitCode).toBe(1);
    expect(error).toHaveBeenCalledWith('Invalid ViewFoundry document:');
  });

  it('errors on unknown command', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = runCli(['nope']);
    expect(result.exitCode).toBe(1);
    expect(error).toHaveBeenCalledWith('Unknown command: nope');
    expect(log).toHaveBeenCalled();
  });

  it('errors on malformed JSON', () => {
    const dir = makeTempDir();
    const path = join(dir, 'bad.json');
    writeFileSync(path, '{not json');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = runCli(['validate', path]);
    expect(result.exitCode).toBe(1);
    expect(error).toHaveBeenCalled();
  });

  it('errors on missing input file', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = runCli(['validate', join(makeTempDir(), 'missing.json')]);
    expect(result.exitCode).toBe(1);
    expect(error).toHaveBeenCalled();
  });
});
