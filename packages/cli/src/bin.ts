#!/usr/bin/env node
import { runCli } from './cli.js';

const result = runCli(process.argv.slice(2));
if (result.exitCode !== 0) {
  process.exit(result.exitCode);
}
