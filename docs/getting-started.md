# Getting Started

## Overview

`@bitmachina/binary` gives you two classes and a set of number types:

- **`Builder`** -- construct a buffer by chaining typed writes
- **`Binary`** -- wrap an existing buffer for sequential reading and writing
- **Number types** -- `u8`, `i8`, `u16`, `i16`, `u32`, `i32`, `u64`, `i64`, `f32`, `f64`

The number types describe how to encode a value: how many bytes it takes and how to read/write it with a `DataView`. Every multi-byte type defaults to little-endian byte order. Big-endian variants are available when you need them.

## Builder

`Builder` is for constructing buffers when you know the data upfront. Chain `.write()` calls and then extract the result.

```ts
import { Builder, u8, u16, u32 } from '@bitmachina/binary';

const buffer = new Builder()
  .write(u32, 44100) // sample rate
  .write(u16, 128) // buffer size
  .write(u8, 2) // channel count
  .toArrayBuffer();
```

Builder tracks the total byte length as you write, so the resulting `ArrayBuffer` is exactly the right size. No over-allocation, no trimming.

### Output formats

```ts
const builder = new Builder().write(u8, 0xff).write(u16, 0x0100);

builder.toArrayBuffer(); // ArrayBuffer (3 bytes)
builder.toUint8Array(); // Uint8Array (3 bytes)
builder.toBytes(); // [0xff, 0x00, 0x01]
```

### Transferable buffers

When sending data to a Web Worker or Audio Worklet via `postMessage`, you want zero-copy transfer. `toTransferable()` builds the buffer and calls `ArrayBuffer.prototype.transfer()`, detaching the data and marking the builder as consumed:

```ts
const buffer = new Builder().write(u8, 0x01).write(u16, 440).toTransferable();

workletNode.port.postMessage({ type: 'note', data: buffer }, [buffer]);
```

After calling `toTransferable()`, any further use of the builder throws an error. This prevents accidental reuse of transferred data.

## Binary

`Binary` is for reading from or writing into an existing buffer. It wraps an `ArrayBuffer` and tracks a byte offset that advances with each operation.

### Creating a Binary

```ts
import { Binary, u8, u16, f32 } from '@bitmachina/binary';

// From a byte length -- allocates a new ArrayBuffer
const bin = new Binary(64);

// From an existing ArrayBuffer
const bin2 = new Binary(someArrayBuffer);

// With a starting byte offset into the buffer
const bin3 = new Binary(someArrayBuffer, 8);
```

### Writing

Each `.write()` call encodes a value at the current offset and advances it:

```ts
const bin = new Binary(16);

bin.write(u8, 0x01); // offset is now 1
bin.write(u16, 1024); // offset is now 3
bin.write(f32, 3.14); // offset is now 7
```

### Reading

Each `.read()` call decodes a value at the current offset and advances it:

```ts
const bin = new Binary(receivedBuffer);

const type = bin.read(u8);
const freq = bin.read(u16);
const amp = bin.read(f32);
```

### Seeking

You can jump to any position in the buffer:

```ts
bin.byteOffset = 0; // rewind to the start
```

This is useful for roundtrip patterns -- write a message, rewind, read it back:

```ts
const bin = new Binary(16);
bin.write(u8, 42);
bin.write(u16, 1000);

bin.byteOffset = 0;

bin.read(u8); // 42
bin.read(u16); // 1000
```

### Extracting data

```ts
const bin = new Binary(64);
bin.write(u8, 1);
bin.write(u16, 2);

bin.toArrayBuffer(); // new ArrayBuffer, 3 bytes (0 to current offset)
bin.toUint8Array(); // Uint8Array view, 3 bytes (0 to current offset)
bin.raw; // the full underlying ArrayBuffer (64 bytes)
```

### Slicing

Create a new `Binary` from a region of the buffer:

```ts
const header = bin.slice(0, 7); // new Binary wrapping bytes 0-6
const body = bin.slice(7); // new Binary wrapping bytes 7 to end
```

### Inserting raw bytes

Copy bytes from a `Uint8Array` into the buffer at the current offset:

```ts
const bin = new Binary(64);
const source = new Uint8Array([10, 20, 30, 40]);

// Insert bytes 1-3 (values 20, 30) at current offset, don't advance
bin.insert(source, 1, 3);

// Insert and advance the offset
bin.insert(source, 0, 4, true);
```

## NumberType

The number types (`u8`, `i8`, `u16`, etc.) are plain objects that implement the `NumberType` interface:

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

You can define your own if you need a custom encoding:

```ts
import type { NumberType } from '@bitmachina/binary';

const bool: NumberType = {
  byteLength: 1,
  read: (view, offset, _le) => (view.getUint8(offset) !== 0 ? 1 : 0),
  write: (view, value, offset, _le) => view.setUint8(offset, value ? 1 : 0),
};
```

Custom types work with both `Binary` and `Builder` -- they're just read/write strategies.

## Big-endian

If you're working with a big-endian protocol, import the big-endian classes. Alias them to the standard names and everything else looks the same:

```ts
import {
  BigEndianBuilder as Builder,
  BigEndianBinary as Binary,
  u8,
  u16,
  u32,
} from '@bitmachina/binary';

const buffer = new Builder().write(u32, 44100).write(u16, 128).write(u8, 2).toArrayBuffer();

const bin = new Binary(buffer);
bin.read(u32); // 44100
bin.read(u16); // 128
bin.read(u8); // 2
```

The default `Builder` and `Binary` classes use little-endian, which is what you want for most Web/Audio Worklet use cases. The big-endian variants exist for when you need them — network protocols, certain file formats, etc.

## A real-world example

Encoding a simple audio event protocol:

```ts
import { Builder, Binary, u8, u16, u32 } from '@bitmachina/binary';

// Event types
const NOTE_ON = 0x01;
const NOTE_OFF = 0x02;

// Encode
function encodeNoteOn(offset: number, slot: number, note: number, velocity: number) {
  return new Builder()
    .write(u32, offset) // sample offset
    .write(u8, NOTE_ON) // event type
    .write(u8, slot) // voice slot
    .write(u8, note) // MIDI note
    .write(u8, velocity) // velocity
    .toTransferable();
}

// Decode
function decodeEvent(buffer: ArrayBuffer) {
  const bin = new Binary(buffer);
  const sampleOffset = bin.read(u32);
  const type = bin.read(u8);

  if (type === NOTE_ON) {
    return {
      type: 'noteOn',
      sampleOffset,
      slot: bin.read(u8),
      note: bin.read(u8),
      velocity: bin.read(u8),
    };
  }

  if (type === NOTE_OFF) {
    return {
      type: 'noteOff',
      sampleOffset,
      slot: bin.read(u8),
    };
  }

  throw new Error(`Unknown event type: ${type}`);
}
```
