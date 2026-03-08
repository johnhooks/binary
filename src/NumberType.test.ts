import { describe, test, expect } from 'vitest';
import { u8, i8, u16, i16, u32, i32, u64, i64, f32, f64 } from './NumberType';

const LE = true;

describe('u8', () => {
  test('roundtrips zero', () => {
    const view = new DataView(new ArrayBuffer(1));
    u8.write(view, 0, 0, LE);
    expect(u8.read(view, 0, LE)).toBe(0);
  });

  test('roundtrips max value', () => {
    const view = new DataView(new ArrayBuffer(1));
    u8.write(view, 255, 0, LE);
    expect(u8.read(view, 0, LE)).toBe(255);
  });
});

describe('i8', () => {
  test('roundtrips positive max', () => {
    const view = new DataView(new ArrayBuffer(1));
    i8.write(view, 127, 0, LE);
    expect(i8.read(view, 0, LE)).toBe(127);
  });

  test('roundtrips negative min', () => {
    const view = new DataView(new ArrayBuffer(1));
    i8.write(view, -128, 0, LE);
    expect(i8.read(view, 0, LE)).toBe(-128);
  });
});

describe('u16', () => {
  test('roundtrips zero', () => {
    const view = new DataView(new ArrayBuffer(2));
    u16.write(view, 0, 0, LE);
    expect(u16.read(view, 0, LE)).toBe(0);
  });

  test('roundtrips max value', () => {
    const view = new DataView(new ArrayBuffer(2));
    u16.write(view, 65535, 0, LE);
    expect(u16.read(view, 0, LE)).toBe(65535);
  });
});

describe('i16', () => {
  test('roundtrips positive max', () => {
    const view = new DataView(new ArrayBuffer(2));
    i16.write(view, 32767, 0, LE);
    expect(i16.read(view, 0, LE)).toBe(32767);
  });

  test('roundtrips negative min', () => {
    const view = new DataView(new ArrayBuffer(2));
    i16.write(view, -32768, 0, LE);
    expect(i16.read(view, 0, LE)).toBe(-32768);
  });
});

describe('u32', () => {
  test('roundtrips zero', () => {
    const view = new DataView(new ArrayBuffer(4));
    u32.write(view, 0, 0, LE);
    expect(u32.read(view, 0, LE)).toBe(0);
  });

  test('roundtrips max value', () => {
    const view = new DataView(new ArrayBuffer(4));
    u32.write(view, 4_294_967_295, 0, LE);
    expect(u32.read(view, 0, LE)).toBe(4_294_967_295);
  });
});

describe('i32', () => {
  test('roundtrips positive max', () => {
    const view = new DataView(new ArrayBuffer(4));
    i32.write(view, 2_147_483_647, 0, LE);
    expect(i32.read(view, 0, LE)).toBe(2_147_483_647);
  });

  test('roundtrips negative min', () => {
    const view = new DataView(new ArrayBuffer(4));
    i32.write(view, -2_147_483_648, 0, LE);
    expect(i32.read(view, 0, LE)).toBe(-2_147_483_648);
  });
});

describe('u64', () => {
  test('roundtrips zero', () => {
    const view = new DataView(new ArrayBuffer(8));
    u64.write(view, 0, 0, LE);
    expect(u64.read(view, 0, LE)).toBe(0);
  });

  test('roundtrips a large safe integer', () => {
    const view = new DataView(new ArrayBuffer(8));
    u64.write(view, 2_147_483_648, 0, LE);
    expect(u64.read(view, 0, LE)).toBe(2_147_483_648);
  });

  test('throws RangeError when value exceeds MAX_SAFE_INTEGER', () => {
    const view = new DataView(new ArrayBuffer(8));
    view.setBigUint64(0, BigInt(2) ** BigInt(53), true);
    expect(() => u64.read(view, 0, LE)).toThrow(RangeError);
  });
});

describe('i64', () => {
  test('roundtrips zero', () => {
    const view = new DataView(new ArrayBuffer(8));
    i64.write(view, 0, 0, LE);
    expect(i64.read(view, 0, LE)).toBe(0);
  });

  test('roundtrips a large positive safe integer', () => {
    const view = new DataView(new ArrayBuffer(8));
    i64.write(view, 2_147_483_648, 0, LE);
    expect(i64.read(view, 0, LE)).toBe(2_147_483_648);
  });

  test('roundtrips a negative value', () => {
    const view = new DataView(new ArrayBuffer(8));
    i64.write(view, -2_147_483_648, 0, LE);
    expect(i64.read(view, 0, LE)).toBe(-2_147_483_648);
  });

  test('throws RangeError when value exceeds safe integer range', () => {
    const view = new DataView(new ArrayBuffer(8));
    view.setBigInt64(0, BigInt(2) ** BigInt(53), true);
    expect(() => i64.read(view, 0, LE)).toThrow(RangeError);
  });
});

describe('f32', () => {
  test('roundtrips zero', () => {
    const view = new DataView(new ArrayBuffer(4));
    f32.write(view, 0, 0, LE);
    expect(f32.read(view, 0, LE)).toBe(0);
  });

  test('roundtrips a float with expected precision loss', () => {
    const view = new DataView(new ArrayBuffer(4));
    f32.write(view, 3.14, 0, LE);
    expect(f32.read(view, 0, LE)).toBeCloseTo(3.14, 2);
  });

  test('roundtrips negative values', () => {
    const view = new DataView(new ArrayBuffer(4));
    f32.write(view, -1.5, 0, LE);
    expect(f32.read(view, 0, LE)).toBe(-1.5);
  });
});

describe('f64', () => {
  test('roundtrips zero', () => {
    const view = new DataView(new ArrayBuffer(8));
    f64.write(view, 0, 0, LE);
    expect(f64.read(view, 0, LE)).toBe(0);
  });

  test('roundtrips with full precision', () => {
    const view = new DataView(new ArrayBuffer(8));
    f64.write(view, Math.PI, 0, LE);
    expect(f64.read(view, 0, LE)).toBe(Math.PI);
  });

  test('roundtrips negative values', () => {
    const view = new DataView(new ArrayBuffer(8));
    f64.write(view, -Math.E, 0, LE);
    expect(f64.read(view, 0, LE)).toBe(-Math.E);
  });
});
