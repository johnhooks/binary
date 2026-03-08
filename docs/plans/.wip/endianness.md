# Configurable Endianness

> Move endianness from the `NumberType` objects to `Builder` and `Binary`, so the byte order is a property of the protocol, not individual fields.

## Current state

Every multi-byte `NumberType` hardcodes little-endian (`true`) in its DataView calls. There's no way to use big-endian without defining custom types.

## Goal

```ts
const builder = new Builder({ endian: 'big' });
builder.write(u16, 1024); // big-endian

const bin = new Binary(buffer, { endian: 'big' });
bin.read(u16); // big-endian
```

Little-endian remains the default. `u8` and `i8` are unaffected (single byte, no byte order).

## Design

### Change the `NumberType` interface

The `read` and `write` functions need to accept a `littleEndian` boolean:

```ts
interface NumberType {
  readonly byteLength: number;
  readonly read: (view: DataView, byteOffset: number, littleEndian: boolean) => number;
  readonly write: (
    view: DataView,
    value: number,
    byteOffset: number,
    littleEndian: boolean,
  ) => void;
}
```

Single-byte types (`u8`, `i8`) ignore the parameter.

### Update the NumberType implementations

```ts
export const u16: NumberType = {
  byteLength: 2,
  read: (view, offset, le) => view.getUint16(offset, le),
  write: (view, value, offset, le) => view.setUint16(offset, value, le),
};
```

### Add endianness to `Builder`

```ts
type Endian = 'little' | 'big';

class Builder {
  #littleEndian: boolean;

  constructor(options?: { endian?: Endian }) {
    this.#littleEndian = (options?.endian ?? 'little') === 'little';
  }

  write(type: NumberType, value: number): Builder {
    // ...
    type.write(view, value, offset, this.#littleEndian);
    // ...
  }
}
```

### Add endianness to `Binary`

The constructor already has an optional `byteOffset` parameter. Extend it with an options object:

```ts
// Current:  new Binary(buffer, byteOffset?)
// Proposed: new Binary(buffer, options?)

interface BinaryOptions {
  byteOffset?: number;
  endian?: Endian;
}

constructor(buffer: ArrayBuffer | number, options?: BinaryOptions) {
  this.#littleEndian = (options?.endian ?? 'little') === 'little';
  // ...
}
```

This is a **breaking change** to the constructor signature — the second argument changes from a plain number to an options object. The old `new Binary(buffer, 8)` becomes `new Binary(buffer, { byteOffset: 8 })`.

### Export the `Endian` type

```ts
export type { NumberType, Endian } from './NumberType';
```

## Breaking changes

- `NumberType` interface gains a `littleEndian` parameter on `read` and `write`
- Any custom `NumberType` implementations need to accept the new parameter
- `Binary` constructor signature changes from `(buffer, byteOffset?)` to `(buffer, options?)`

## Test plan

- Existing tests continue to pass (default is little-endian, same as before)
- Add big-endian roundtrip tests for `Binary` and `Builder`
- Verify multi-byte types respect the setting
- Verify single-byte types work regardless of setting
