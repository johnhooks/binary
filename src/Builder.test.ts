import { describe, test, expect } from 'vitest';
import { Builder } from './Builder';
import { u8, u16, f32 } from './NumberType';

describe('Builder', () => {
  describe('toArrayBuffer', () => {
    test('produces an ArrayBuffer with correct values', () => {
      const buffer = new Builder().write(u8, 255).write(u16, 1024).toArrayBuffer();
      const view = new DataView(buffer);
      expect(buffer.byteLength).toBe(3);
      expect(view.getUint8(0)).toBe(255);
      expect(view.getUint16(1, true)).toBe(1024);
    });
  });

  describe('toUint8Array', () => {
    test('produces a Uint8Array with correct values', () => {
      const result = new Builder().write(u8, 42).write(u8, 99).toUint8Array();
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.byteLength).toBe(2);
      expect(result[0]).toBe(42);
      expect(result[1]).toBe(99);
    });
  });

  describe('toBytes', () => {
    test('produces an array of bytes with correct values', () => {
      const bytes = new Builder().write(u8, 0xff).write(u16, 0x0100).toBytes();
      expect(bytes).toEqual([0xff, 0x00, 0x01]);
    });
  });

  describe('write chaining', () => {
    test('returns the builder for chaining', () => {
      const builder = new Builder();
      const result = builder.write(u8, 1).write(u16, 2).write(f32, 3.14);
      expect(result).toBe(builder);
    });
  });

  describe('toTransferable', () => {
    test('returns a correctly sized ArrayBuffer', () => {
      const buffer = new Builder().write(u8, 42).write(u16, 1024).toTransferable();
      expect(buffer.byteLength).toBe(3);
      const view = new DataView(buffer);
      expect(view.getUint8(0)).toBe(42);
      expect(view.getUint16(1, true)).toBe(1024);
    });

    test('throws on write after transfer', () => {
      const builder = new Builder().write(u8, 1);
      builder.toTransferable();
      expect(() => builder.write(u8, 2)).toThrow('Builder has been transferred');
    });

    test('throws on toArrayBuffer after transfer', () => {
      const builder = new Builder().write(u8, 1);
      builder.toTransferable();
      expect(() => builder.toArrayBuffer()).toThrow('Builder has been transferred');
    });

    test('throws on toTransferable after transfer', () => {
      const builder = new Builder().write(u8, 1);
      builder.toTransferable();
      expect(() => builder.toTransferable()).toThrow('Builder has been transferred');
    });
  });
});
