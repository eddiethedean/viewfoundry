import { mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDocument, createNode } from '@viewfoundry/core';
import { loadDocument, printHelp, resolveSafeOutputPath, runCli } from './cli.js';

describe('runCli', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    try {
      unlinkSync(resolve('GeneratedView.tsx'));
    } catch {
      // ignore if export test did not run
    }
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
    const outputName = 'GeneratedView.tsx';

    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = runCli(['export', inputPath, outputName]);

    expect(result.exitCode).toBe(0);
    expect(readFileSync(outputName, 'utf-8')).toContain('export function GeneratedView()');
    expect(log).toHaveBeenCalledWith(`Wrote ${resolve(process.cwd(), outputName)}`);
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

  it('fails validation for invalid node.style', () => {
    const doc = createDocument();
    doc.root.children = [
      createNode('Button', { children: 'Hi' }, [], 'btn1', undefined, { opacity: 2 }),
    ];
    const inputPath = writeFixture('bad-style.json', doc);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = runCli(['validate', inputPath]);
    expect(result.exitCode).toBe(1);
    expect(error).toHaveBeenCalledWith('Invalid ViewFoundry document:');
  });

  it('errors when export output path escapes working directory', () => {
    const doc = createDocument();
    const inputPath = writeFixture('doc.json', doc);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = runCli(['export', inputPath, '../outside.tsx']);
    expect(result.exitCode).toBe(1);
    expect(error).toHaveBeenCalledWith(
      'Error: output path must stay within the current working directory',
    );
  });

  it('resolveSafeOutputPath rejects traversal', () => {
    expect(resolveSafeOutputPath('../escape.tsx')).toBeNull();
    expect(resolveSafeOutputPath('GeneratedView.tsx')).not.toBeNull();
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

  it('exports with imports map from --imports', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hi' }, [], 'b1')];
    const inputPath = writeFixture('doc.json', doc);
    const importsPath = join(makeTempDir(), 'imports.json');
    writeFileSync(
      importsPath,
      JSON.stringify({
        Button: { importPath: './components', exportName: 'Button' },
      }),
    );
    const outputName = 'GeneratedView.tsx';
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = runCli(['export', inputPath, outputName, '--imports', importsPath]);
    expect(result.exitCode).toBe(0);
    expect(readFileSync(outputName, 'utf-8')).toContain("import { Button } from './components'");
  });

  it('exits non-zero with --strict when imports are missing', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hi' }, [], 'b1')];
    const inputPath = writeFixture('doc.json', doc);
    const outputName = 'GeneratedView.tsx';
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = runCli(['export', inputPath, outputName, '--strict']);
    expect(result.exitCode).toBe(1);
  });
});
