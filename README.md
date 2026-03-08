# @bitmachina/binary

A tiny, zero-dependency toolkit for reading and writing binary data with `ArrayBuffer` and `DataView`. Think of it as the missing middle ground between raw `DataView` calls and a full serialization framework -- just enough structure to stop you from losing track of where you are in a buffer.

Built for anywhere JavaScript runs: browsers, workers, Audio Worklets, Node.js. No polyfills, no platform-specific APIs.

## Why?

Working with binary protocols means a lot of bookkeeping. You're always tracking byte offsets, remembering which `get`/`set` method to call, and hoping you didn't accidentally read 4 bytes when you meant 2. This library handles that so you can focus on your actual protocol.

## Quick taste

```ts
import { Binary, Builder, u8, u16, f32 } from '@bitmachina/binary';

// Build a message
const buffer = new Builder()
  .write(u8, 0x01) // message type
  .write(u16, 440) // frequency
  .write(f32, 0.8) // amplitude
  .toArrayBuffer();

// Read it back
const reader = new Binary(buffer);
const type = reader.read(u8); // 0x01
const freq = reader.read(u16); // 440
const amp = reader.read(f32); // ~0.8
```

## Install

```sh
npm install @bitmachina/binary
```

Requires Node >= 22 (for `ArrayBuffer.prototype.transfer`).

## Number types

| Type  | Bytes | Range                              |
| ----- | ----- | ---------------------------------- |
| `u8`  | 1     | 0 to 255                           |
| `i8`  | 1     | -128 to 127                        |
| `u16` | 2     | 0 to 65,535                        |
| `i16` | 2     | -32,768 to 32,767                  |
| `u32` | 4     | 0 to 4,294,967,295                 |
| `i32` | 4     | -2,147,483,648 to 2,147,483,647    |
| `u64` | 8     | 0 to 2^53 - 1 (safe integer range) |
| `i64` | 8     | -(2^53 - 1) to 2^53 - 1            |
| `f32` | 4     | 32-bit float                       |
| `f64` | 8     | 64-bit float (full precision)      |

All multi-byte types default to **little-endian** byte order. Big-endian classes (`BigEndianBuilder`, `BigEndianBinary`) are available for protocols that need it.

## Docs

See [Getting Started](./docs/getting-started.md) for the full API walkthrough.

## License

[GPL-3.0](./LICENSE.md)
