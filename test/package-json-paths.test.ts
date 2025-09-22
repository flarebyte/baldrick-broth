import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';

const root = process.cwd();

const exists = (relPath: string) => fs.existsSync(path.resolve(root, relPath));

test('package.json: bin/main/exports paths exist after build', async () => {
  // Ensure build artifacts exist
  await execa('yarn', ['build'], { stdio: 'ignore' });

  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
  ) as any;

  // bin can be a string or object
  if (typeof pkg.bin === 'string') {
    assert.ok(
      exists(pkg.bin),
      `bin path does not exist: ${pkg.bin}`,
    );
  } else if (pkg.bin && typeof pkg.bin === 'object') {
    for (const [name, p] of Object.entries<string>(pkg.bin)) {
      assert.ok(
        exists(p),
        `bin path for ${name} does not exist: ${p}`,
      );
    }
  }

  // main (optional)
  if (typeof pkg.main === 'string') {
    assert.ok(
      exists(pkg.main),
      `main path does not exist: ${pkg.main}`,
    );
  }

  // exports
  const exp = pkg.exports;
  if (exp && typeof exp === 'object') {
    // Common pattern: "." export with import/default/types
    const dot = exp['.'];
    if (dot && typeof dot === 'object') {
      const importPath = dot.import as string | undefined;
      const defaultPath = dot.default as string | undefined;
      const typesPath = dot.types as string | undefined;

      if (importPath) {
        assert.ok(
          exists(importPath),
          `exports["."].import path does not exist: ${importPath}`,
        );
      }
      if (defaultPath) {
        assert.ok(
          exists(defaultPath),
          `exports["."].default path does not exist: ${defaultPath}`,
        );
      }
      if (typesPath) {
        assert.ok(
          exists(typesPath),
          `exports["."].types path does not exist: ${typesPath}`,
        );
      }
    }
  }
});

