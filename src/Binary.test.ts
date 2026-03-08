import { describe, test, expect, beforeEach } from 'vitest';
import { Binary } from './Binary';
import { u8, u16, u32, u64, f32, f64 } from './NumberType';

let binary: Binary;

describe('Binary Constructor', () => {
  test('creates a wrapped buffer with a byte length argument', () => {
    binary = new Binary(64);
    expect(binary.raw).toBeInstanceOf(ArrayBuffer);
    expect(binary.length).toBe(64);
  });

  test('creates a wrapped buffer with ArrayBuffer argument', () => {
    const buffer = new ArrayBuffer(64);
    binary = new Binary(buffer);
    expect(binary.raw).toBeInstanceOf(ArrayBuffer);
    expect(binary.length).toBe(64);
  });
});

describe('Binary#write', () => {
  beforeEach(() => {
    binary = new Binary(64);
  });

  describe('u8 NumberType', () => {
    const value = 1;
    beforeEach(() => binary.write(u8, value));

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(1);
    });

    test('contains the correct value', () => {
      const view = new DataView(binary.raw);
      expect(view.getUint8(0)).toBe(value);
    });
  });

  describe('u16 NumberType', () => {
    const value = 256;
    beforeEach(() => binary.write(u16, value));

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(2);
    });

    test('contains the correct value', () => {
      const view = new DataView(binary.raw);
      expect(view.getUint16(0, true)).toBe(value);
    });
  });

  describe('u32 NumberType', () => {
    const value = 65536;
    beforeEach(() => binary.write(u32, value));

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(4);
    });

    test('contains the correct value', () => {
      const view = new DataView(binary.raw);
      expect(view.getUint32(0, true)).toBe(value);
    });
  });

  describe('u64 NumberType', () => {
    const value = 2_147_483_648;
    beforeEach(() => binary.write(u64, value));

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(8);
    });

    test('contains the correct value', () => {
      const view = new DataView(binary.raw);
      expect(Number(view.getBigUint64(0, true))).toBe(value);
    });
  });

  describe('f32 NumberType', () => {
    const value = 3.14;
    beforeEach(() => binary.write(f32, value));

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(4);
    });

    test('contains the correct value', () => {
      const view = new DataView(binary.raw);
      const expected = Math.round(value * 1000);
      const number = Math.round(view.getFloat32(0, true) * 1000);
      expect(number).toBe(expected);
    });
  });

  describe('f64 NumberType', () => {
    const value = Math.PI;
    beforeEach(() => binary.write(f64, value));

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(8);
    });

    test('contains the correct value', () => {
      const view = new DataView(binary.raw);
      expect(view.getFloat64(0, true)).toBe(value);
    });
  });
});

describe('Binary Constructor errors', () => {
  test('throws RangeError for negative byteOffset', () => {
    const buffer = new ArrayBuffer(64);
    expect(() => new Binary(buffer, -1)).toThrow(RangeError);
  });

  test('throws RangeError for byteOffset beyond buffer length', () => {
    const buffer = new ArrayBuffer(64);
    expect(() => new Binary(buffer, 64)).toThrow(RangeError);
  });
});

describe('Binary#byteOffset setter', () => {
  test('sets the offset', () => {
    const binary = new Binary(64);
    binary.byteOffset = 10;
    expect(binary.byteOffset).toBe(10);
  });

  test('throws RangeError for negative value', () => {
    const binary = new Binary(64);
    expect(() => { binary.byteOffset = -1; }).toThrow(RangeError);
  });

  test('throws RangeError for value beyond buffer length', () => {
    const binary = new Binary(64);
    expect(() => { binary.byteOffset = 64; }).toThrow(RangeError);
  });
});

describe('Binary#toArrayBuffer', () => {
  test('returns a buffer sliced to the current offset', () => {
    const binary = new Binary(64);
    binary.write(u8, 1);
    binary.write(u16, 256);
    const result = binary.toArrayBuffer();
    expect(result.byteLength).toBe(3);
    const view = new DataView(result);
    expect(view.getUint8(0)).toBe(1);
    expect(view.getUint16(1, true)).toBe(256);
  });

  test('returns an empty buffer when nothing has been written', () => {
    const binary = new Binary(64);
    expect(binary.toArrayBuffer().byteLength).toBe(0);
  });
});

describe('Binary#toUint8Array', () => {
  test('returns a Uint8Array view up to the current offset', () => {
    const binary = new Binary(64);
    binary.write(u8, 0xff);
    binary.write(u8, 0xab);
    const result = binary.toUint8Array();
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.byteLength).toBe(2);
    expect(result[0]).toBe(0xff);
    expect(result[1]).toBe(0xab);
  });
});

describe('Binary#slice', () => {
  test('returns a new Binary wrapping a copy of the sliced region', () => {
    const binary = new Binary(64);
    binary.write(u8, 10);
    binary.write(u8, 20);
    binary.write(u8, 30);
    const sliced = binary.slice(1, 3);
    expect(sliced.length).toBe(2);
    expect(sliced.read(u8)).toBe(20);
    expect(sliced.read(u8)).toBe(30);
  });

  test('defaults to the full buffer', () => {
    const binary = new Binary(8);
    const sliced = binary.slice();
    expect(sliced.length).toBe(8);
  });
});

describe('Binary#insert', () => {
  test('inserts data at the current offset without advancing', () => {
    const binary = new Binary(64);
    const source = new Uint8Array([10, 20, 30, 40]);
    const end = binary.insert(source, 1, 3);
    expect(end).toBe(2);
    expect(binary.byteOffset).toBe(0);
    expect(binary.read(u8)).toBe(20);
    expect(binary.read(u8)).toBe(30);
  });

  test('inserts data and advances offset when jump is true', () => {
    const binary = new Binary(64);
    const source = new Uint8Array([10, 20, 30, 40]);
    const end = binary.insert(source, 0, 4, true);
    expect(end).toBe(4);
    expect(binary.byteOffset).toBe(4);
  });
});

describe('Binary roundtrip', () => {
  test('writes then reads multiple types sequentially', () => {
    const binary = new Binary(64);
    binary.write(u8, 42);
    binary.write(u16, 1000);
    binary.write(u32, 100000);
    binary.write(f64, Math.E);

    binary.byteOffset = 0;

    expect(binary.read(u8)).toBe(42);
    expect(binary.read(u16)).toBe(1000);
    expect(binary.read(u32)).toBe(100000);
    expect(binary.read(f64)).toBeCloseTo(Math.E);
  });
});

describe('Binary#read', () => {
  beforeEach(() => {
    binary = new Binary(64);
  });

  describe('u8 NumberType', () => {
    const value = 1;
    let result: number;

    beforeEach(() => {
      const view = new DataView(binary.raw);
      view.setUint8(0, value);
      result = binary.read(u8);
    });

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(1);
    });

    test('contains the correct value', () => {
      expect(result).toBe(value);
    });
  });

  describe('u16 NumberType', () => {
    const value = 256;
    let result: number;

    beforeEach(() => {
      const view = new DataView(binary.raw);
      view.setUint16(0, value, true);
      result = binary.read(u16);
    });

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(2);
    });

    test('contains the correct value', () => {
      expect(result).toBe(value);
    });
  });

  describe('u32 NumberType', () => {
    const value = 65536;
    let result: number;

    beforeEach(() => {
      const view = new DataView(binary.raw);
      view.setUint32(0, value, true);
      result = binary.read(u32);
    });

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(4);
    });

    test('contains the correct value', () => {
      expect(result).toBe(value);
    });
  });

  describe('u64 NumberType', () => {
    const value = 2_147_483_648;
    let result: number;

    beforeEach(() => {
      const view = new DataView(binary.raw);
      view.setBigUint64(0, BigInt(value), true);
      result = binary.read(u64);
    });

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(8);
    });

    test('contains the correct value', () => {
      expect(result).toBe(value);
    });
  });

  describe('f32 NumberType', () => {
    const value = 3.14;
    let result: number;

    beforeEach(() => {
      const view = new DataView(binary.raw);
      view.setFloat32(0, value, true);
      result = binary.read(f32);
    });

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(4);
    });

    test('contains the correct value', () => {
      expect(Math.round(result * 1000)).toBe(Math.round(value * 1000));
    });
  });

  describe('f64 NumberType', () => {
    const value = Math.PI;
    let result: number;

    beforeEach(() => {
      const view = new DataView(binary.raw);
      view.setFloat64(0, value, true);
      result = binary.read(f64);
    });

    test('increments the byte offset', () => {
      expect(binary.byteOffset).toBe(8);
    });

    test('contains the correct value', () => {
      expect(result).toBe(value);
    });
  });
});
