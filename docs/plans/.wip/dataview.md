# Modernise @bitmachina/binary — DataView + Tooling Refresh

> Refactor the library from Node.js `Buffer` to `ArrayBuffer`/`DataView` so it
> runs in browsers, Web Workers, and Audio Worklets. Simultaneously modernise
> the build and test tooling.

---

## Phase 1 — Tooling Modernisation

No source changes yet; swap the infrastructure so the new toolchain is in place
before touching library code.

### 1.1 Replace devDependencies

**Remove:**

- `rollup`, `@rollup/plugin-typescript`
- `jest`, `ts-jest`, `@types/jest`
- `@types/node`
- `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
- `eslint` (v7), `eslint-plugin-import`, `eslint-plugin-jest`
- `shx`, `tslib`

**Add:**

- `typescript` ^5.7
- `tsup` (latest)
- `vitest` (latest)
- `eslint` (v9)
- `@eslint/js`
- `typescript-eslint` (unified v8+ package)
- `prettier` ^3

### 1.2 Add `tsup.config.ts`

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
});
```

Delete `rollup.config.js`.

### 1.3 Update `package.json`

```jsonc
{
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "lint": "tsc --noEmit && eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepare": "npm run lint && npm run test && npm run build"
  }
}
```

Remove `engines`, `browserslist`, and the old `main`/`typings`/`prebuild` fields.

### 1.4 Update `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    "lib": ["ES2022"],
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.ts"]
}
```

Key: drop `"types": ["node"]` — the library must not depend on Node.js types.

### 1.5 Replace ESLint config

Delete `.eslintrc.js` and `.eslintignore`. Create `eslint.config.js` (flat config):

```js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  { ignores: ['dist/**'] },
);
```

### 1.6 Update Prettier

In `.prettierrc`, change `"trailingComma": "es5"` to `"trailingComma": "all"`.

### 1.7 Delete obsolete files

- `rollup.config.js`
- `jest.config.js`
- `.eslintrc.js`
- `.eslintignore`

---

## Phase 2 — Buffer to ArrayBuffer/DataView Migration

### 2.1 Rewrite `NumberType` interface and implementations

Move the `NumberType` interface from `src/types.d.ts` into `src/NumberType.ts`.
Change from bound `Buffer.prototype` methods to explicit DataView functions:

```ts
export interface NumberType {
  readonly byteLength: number;
  readonly read: (view: DataView, byteOffset: number) => number;
  readonly write: (view: DataView, value: number, byteOffset: number) => void;
}

export const u8: NumberType = {
  byteLength: 1,
  read: (view, offset) => view.getUint8(offset),
  write: (view, value, offset) => view.setUint8(offset, value),
};

export const u16: NumberType = {
  byteLength: 2,
  read: (view, offset) => view.getUint16(offset, true),
  write: (view, value, offset) => view.setUint16(offset, value, true),
};

export const u32: NumberType = {
  byteLength: 4,
  read: (view, offset) => view.getUint32(offset, true),
  write: (view, value, offset) => view.setUint32(offset, value, true),
};

export const u64: NumberType = {
  byteLength: 8,
  read(view, offset) {
    const low = view.getUint32(offset, true);
    const high = view.getUint32(offset + 4, true);
    const value = low + high * 2 ** 32;
    if (!Number.isSafeInteger(value)) {
      console.warn(value, 'exceeds MAX_SAFE_INTEGER.');
    }
    return value;
  },
  write(view, value, offset) {
    view.setBigUint64(offset, BigInt(value), true);
  },
};

export const f32: NumberType = {
  byteLength: 4,
  read: (view, offset) => view.getFloat32(offset, true),
  write: (view, value, offset) => view.setFloat32(offset, value, true),
};

export const f64: NumberType = {
  byteLength: 8,
  read: (view, offset) => view.getFloat64(offset, true),
  write: (view, value, offset) => view.setFloat64(offset, value, true),
};
```

All types use little-endian (`true`) to match the existing `*LE` Buffer methods.

### 2.2 Rewrite `Binary` class

Replace internal `_buffer: Buffer` with `_buffer: ArrayBuffer` + `_view: DataView`.

| Before | After |
|--------|-------|
| `constructor(buffer: Buffer \| number)` | `constructor(buffer: ArrayBuffer \| number)` |
| `raw: Buffer` | `raw: ArrayBuffer` |
| `toBuffer(): Buffer` | `toArrayBuffer(): ArrayBuffer` |
| `insert(source: Buffer, ...)` | `insert(source: Uint8Array, ...)` |
| offset returned from `Buffer.write*` | offset tracked internally via `+= type.byteLength` |

Add a `toUint8Array(): Uint8Array` convenience method (useful for the
sequencer's MessagePort transfer pattern).

### 2.3 Rewrite `Builder` class

- `toBuffer()` becomes `toArrayBuffer(): ArrayBuffer`
- Internal scratch buffer changes from `Buffer.alloc(8)` to `new ArrayBuffer(8)` +
  `new DataView(scratch)`
- Add `toUint8Array(): Uint8Array` convenience method

### 2.4 Update `src/index.ts` exports

```ts
export { Binary } from './Binary';
export { Builder } from './Builder';
export { u8, u16, u32, u64, f32, f64 } from './NumberType';
export type { NumberType } from './NumberType';
```

Export the `NumberType` type so consumers can write generic helpers.

### 2.5 Delete `src/types.d.ts`

No longer needed — the interface lives in `NumberType.ts` and tsup generates
declaration files from source.

---

## Phase 3 — Test Migration (Jest to Vitest)

### 3.1 Delete `jest.config.js`

Vitest needs no config file for this project (defaults are sufficient).
Optionally add a minimal `vitest.config.ts` if needed:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
```

### 3.2 Rewrite `src/Binary.test.ts`

- Replace `/// <reference types="jest" />` with
  `import { describe, test, expect, beforeEach } from 'vitest'`
- Replace `Buffer` construction/assertions with `ArrayBuffer`/`DataView`
- Use public API (`binary.raw`, `binary.byteOffset`) instead of accessing
  private fields (`binary._buffer`, `binary._byteOffset`)

Write-side verification pattern:

```ts
test('contains the correct value', () => {
  binary.write(u16, 42);
  const view = new DataView(binary.raw);
  expect(view.getUint16(0, true)).toBe(42);
});
```

Read-side setup pattern:

```ts
beforeEach(() => {
  const view = new DataView(binary.raw);
  view.setUint16(0, 42, true);
  result = binary.read(u16);
});
```

### 3.3 Add `src/Builder.test.ts`

The `Builder` class is currently untested. Add coverage for:

- `write()` chaining
- `toBytes()` output correctness
- `toArrayBuffer()` output correctness
- Multi-type builds (mixed u8, u16, f32, etc.)

### 3.4 Verify

```sh
npm run lint && npm run test && npm run build
```

All three must pass before moving on.

---

## Phase 4 — Cleanup and Release

### 4.1 Update README

- Change description from "A Node.js Buffer Wrapper" to something
  platform-neutral
- Update usage examples to show `ArrayBuffer`/`DataView` API
- Note browser/worklet compatibility

### 4.2 Version bump

This is a **breaking change** to the public API (`Buffer` types removed,
method renames). Bump to the next major version.

### 4.3 Final file inventory

**Deleted:**

- `rollup.config.js`
- `jest.config.js`
- `.eslintrc.js`
- `.eslintignore`
- `src/types.d.ts`

**Created:**

- `tsup.config.ts`
- `eslint.config.js`
- `src/Builder.test.ts`

**Modified:**

- `package.json`
- `tsconfig.json`
- `.prettierrc`
- `src/NumberType.ts`
- `src/Binary.ts`
- `src/Builder.ts`
- `src/Binary.test.ts`
- `src/index.ts`
- `README.md`

---

## Notes

- The `dataview` branch already exists but is empty (identical to master).
  Consider reusing it or creating a fresh branch.
- Downstream consumer: `@daisysp-wasm/protocol` in
  `/home/hooks/Projects/daisysp-wasm` depends on this library being
  ArrayBuffer-based (see `docs/plans/.wip/sequencer.md` Phase 2.2).
- The sequencer's transfer pattern is:
  `workletNode.port.postMessage({ type: 'sequence', data: buffer }, [buffer])`
  — `toArrayBuffer()` produces exactly the right type for the transfer list.
