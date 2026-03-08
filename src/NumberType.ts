/**
 * An interface to help build serial protocol schemas.
 */
export interface NumberType {
  readonly byteLength: number;
  readonly read: (view: DataView, byteOffset: number) => number;
  readonly write: (view: DataView, value: number, byteOffset: number) => void;
}

/**
 * An Unsigned 8 Bit Integer
 */
export const u8: NumberType = {
  byteLength: 1,
  read: (view, offset) => view.getUint8(offset),
  write: (view, value, offset) => view.setUint8(offset, value),
};

/**
 * A Signed 8 Bit Integer
 */
export const i8: NumberType = {
  byteLength: 1,
  read: (view, offset) => view.getInt8(offset),
  write: (view, value, offset) => view.setInt8(offset, value),
};

/**
 * An Unsigned 16 Bit Integer
 */
export const u16: NumberType = {
  byteLength: 2,
  read: (view, offset) => view.getUint16(offset, true),
  write: (view, value, offset) => view.setUint16(offset, value, true),
};

/**
 * A Signed 16 Bit Integer
 */
export const i16: NumberType = {
  byteLength: 2,
  read: (view, offset) => view.getInt16(offset, true),
  write: (view, value, offset) => view.setInt16(offset, value, true),
};

/**
 * An Unsigned 32 Bit Integer
 */
export const u32: NumberType = {
  byteLength: 4,
  read: (view, offset) => view.getUint32(offset, true),
  write: (view, value, offset) => view.setUint32(offset, value, true),
};

/**
 * A Signed 32 Bit Integer
 */
export const i32: NumberType = {
  byteLength: 4,
  read: (view, offset) => view.getInt32(offset, true),
  write: (view, value, offset) => view.setInt32(offset, value, true),
};

/**
 * An Unsigned 64 Bit Integer
 *
 * Consider using BigInt.
 */
export const u64: NumberType = {
  byteLength: 8,
  read(view, offset) {
    const low = view.getUint32(offset, true);
    const high = view.getUint32(offset + 4, true);
    const value = low + high * 2 ** 32;
    if (!Number.isSafeInteger(value)) {
      throw new RangeError(`${value} exceeds MAX_SAFE_INTEGER`);
    }
    return value;
  },
  write(view, value, offset) {
    view.setBigUint64(offset, BigInt(value), true);
  },
};

/**
 * A Signed 64 Bit Integer
 *
 * Consider using BigInt.
 */
export const i64: NumberType = {
  byteLength: 8,
  read(view, offset) {
    const low = view.getUint32(offset, true);
    const high = view.getInt32(offset + 4, true);
    const value = low + high * 2 ** 32;
    if (!Number.isSafeInteger(value)) {
      throw new RangeError(`${value} exceeds safe integer range`);
    }
    return value;
  },
  write(view, value, offset) {
    view.setBigInt64(offset, BigInt(value), true);
  },
};

/**
 * A 32 Bit Floating Point Number
 */
export const f32: NumberType = {
  byteLength: 4,
  read: (view, offset) => view.getFloat32(offset, true),
  write: (view, value, offset) => view.setFloat32(offset, value, true),
};

/**
 * A 64 Bit Floating Point Number
 */
export const f64: NumberType = {
  byteLength: 8,
  read: (view, offset) => view.getFloat64(offset, true),
  write: (view, value, offset) => view.setFloat64(offset, value, true),
};
