import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const version = process.env.VERSION;
if (!version) {
  console.error('VERSION environment variable is required');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+(-[\w.-]+)?$/.test(version)) {
  console.error(`Invalid semver version: ${version}`);
  process.exit(1);
}

function setVersion(path) {
  const pkg = JSON.parse(readFileSync(path, 'utf8'));
  pkg.version = version;
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`Set ${pkg.name ?? path} -> ${version}`);
}

setVersion('package.json');

for (const dir of readdirSync('packages')) {
  setVersion(join('packages', dir, 'package.json'));
}
