/// <reference types="jest" />

import { Binary } from "./index";
import { u8, u16, u32, u64, f32, f64 } from "./NumberType";
let binary: any;

describe("Binary Constructor", () => {
  test("creates a wrapped buffer with a byte length argument", () => {
    binary = new Binary(64);
    expect(Buffer.isBuffer(binary._buffer)).toBeTruthy();
    expect(binary._buffer.length).toBe(64);
  });

  test("creates a wrapped buffer with Buffer argument", () => {
    const buffer = Buffer.alloc(64);
    binary = new Binary(buffer);
    expect(Buffer.isBuffer(binary._buffer)).toBeTruthy();
    expect(binary._buffer.length).toBe(64);
  });
});

describe("Binary#write", () => {
  beforeEach(() => {
    binary = new Binary(64);
  });

  describe("u8 NumberType", () => {
    const value = 1;
    beforeEach(() => binary.write(u8, value));

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(1);
    });

    test("contains the correct value", () => {
      expect(binary._buffer.readUInt8(0)).toBe(value);
    });
  });

  describe("u16 NumberType", () => {
    const value = 256;
    beforeEach(() => binary.write(u16, value));

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(2);
    });

    test("contains the correct value", () => {
      expect(binary._buffer.readUInt16LE(0)).toBe(value);
    });
  });

  describe("u32 NumberType", () => {
    const value = 65536;
    beforeEach(() => binary.write(u32, value));

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(4);
    });

    test("contains the correct value", () => {
      expect(binary._buffer.readUInt32LE(0)).toBe(value);
    });
  });

  describe("u64 NumberType", () => {
    const value = 2_147_483_648;
    beforeEach(() => binary.write(u64, value));

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(8);
    });

    test("contains the correct value", () => {
      expect(Number(binary._buffer.readBigUInt64LE(0))).toBe(value);
    });
  });

  describe("f32 NumberType", () => {
    const value = 3.14;
    beforeEach(() => binary.write(f32, value));

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(4);
    });

    test("contains the correct value", () => {
      const expected = Math.round(value * 1000);
      const number = Math.round(binary._buffer.readFloatLE(0) * 1000);
      expect(number).toBe(expected);
    });
  });

  describe("f64 NumberType", () => {
    const value = Math.PI;
    beforeEach(() => binary.write(f64, value));

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(8);
    });

    test("contains the correct value", () => {
      const number = binary._buffer.readDoubleLE(0);
      expect(number).toBe(value);
    });
  });
});

describe("Binary#read", () => {
  beforeEach(() => {
    binary = new Binary(64);
  });

  describe("u8 NumberType", () => {
    const value = 1;
    let result: number;

    beforeEach(() => {
      binary._buffer.writeUInt8(value, 0);
      result = binary.read(u8);
    });

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(1);
    });

    test("contains the correct value", () => {
      expect(result).toBe(value);
    });
  });

  describe("u16 NumberType", () => {
    const value = 256;
    let result: number;

    beforeEach(() => {
      binary._buffer.writeUInt16LE(value, 0);
      result = binary.read(u16);
    });

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(2);
    });

    test("contains the correct value", () => {
      expect(result).toBe(value);
    });
  });

  describe("u32 NumberType", () => {
    const value = 65536;
    let result: number;

    beforeEach(() => {
      binary._buffer.writeUInt32LE(value, 0);
      result = binary.read(u32);
    });

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(4);
    });

    test("contains the correct value", () => {
      expect(result).toBe(value);
    });
  });

  describe("u64 NumberType", () => {
    const value = 2_147_483_648;
    let result: number;

    beforeEach(() => {
      binary._buffer.writeBigUInt64LE(BigInt(value), 0);
      result = binary.read(u64);
    });

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(8);
    });

    test("contains the correct value", () => {
      expect(result).toBe(value);
    });
  });

  describe("f32 NumberType", () => {
    const value = 3.14;
    let result: number;

    beforeEach(() => {
      binary._buffer.writeFloatLE(value, 0);
      result = binary.read(f32);
    });

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(4);
    });

    test("contains the correct value", () => {
      expect(Math.round(result * 1000)).toBe(Math.round(value * 1000));
    });
  });

  describe("f64 NumberType", () => {
    const value = Math.PI;
    let result: number;

    beforeEach(() => {
      binary._buffer.writeDoubleLE(value, 0);
      result = binary.read(f64);
    });

    test("increments the byte offset", () => {
      expect(binary._byteOffset).toBe(8);
    });

    test("contains the correct value", () => {
      expect(result).toBe(value);
    });
  });
});
