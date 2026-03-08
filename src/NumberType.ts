/**
 * Byte order for multi-byte types.
 */
export type Endian = 'little' | 'big';

/**
 * An interface to help build serial protocol schemas.
 */
export interface NumberType {
  readonly byteLength: number;
  readonly read: (view: DataView, byteOffset: number, littleEndian: boolean) => number;
  readonly write: (
    view: DataView,
    value: number,
    byteOffset: number,
    littleEndian: boolean,
  ) => void;
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
  read: (view, offset, le) => view.getUint16(offset, le),
  write: (view, value, offset, le) => view.setUint16(offset, value, le),
};

/**
 * A Signed 16 Bit Integer
 */
export const i16: NumberType = {
  byteLength: 2,
  read: (view, offset, le) => view.getInt16(offset, le),
  write: (view, value, offset, le) => view.setInt16(offset, value, le),
};

/**
 * An Unsigned 32 Bit Integer
 */
export const u32: NumberType = {
  byteLength: 4,
  read: (view, offset, le) => view.getUint32(offset, le),
  write: (view, value, offset, le) => view.setUint32(offset, value, le),
};

/**
 * A Signed 32 Bit Integer
 */
export const i32: NumberType = {
  byteLength: 4,
  read: (view, offset, le) => view.getInt32(offset, le),
  write: (view, value, offset, le) => view.setInt32(offset, value, le),
};

/**
 * An Unsigned 64 Bit Integer
 *
 * Consider using BigInt.
 */
export const u64: NumberType = {
  byteLength: 8,
  read(view, offset, le) {
    const low = view.getUint32(le ? offset : offset + 4, le);
    const high = view.getUint32(le ? offset + 4 : offset, le);
    const value = low + high * 2 ** 32;
    if (!Number.isSafeInteger(value)) {
      throw new RangeError(`${value} exceeds MAX_SAFE_INTEGER`);
    }
    return value;
  },
  write(view, value, offset, le) {
    view.setBigUint64(offset, BigInt(value), le);
  },
};

/**
 * A Signed 64 Bit Integer
 *
 * Consider using BigInt.
 */
export const i64: NumberType = {
  byteLength: 8,
  read(view, offset, le) {
    const low = view.getUint32(le ? offset : offset + 4, le);
    const high = view.getInt32(le ? offset + 4 : offset, le);
    const value = low + high * 2 ** 32;
    if (!Number.isSafeInteger(value)) {
      throw new RangeError(`${value} exceeds safe integer range`);
    }
    return value;
  },
  write(view, value, offset, le) {
    view.setBigInt64(offset, BigInt(value), le);
  },
};

/**
 * A 32 Bit Floating Point Number
 */
export const f32: NumberType = {
  byteLength: 4,
  read: (view, offset, le) => view.getFloat32(offset, le),
  write: (view, value, offset, le) => view.setFloat32(offset, value, le),
};

/**
 * A 64 Bit Floating Point Number
 */
export const f64: NumberType = {
  byteLength: 8,
  read: (view, offset, le) => view.getFloat64(offset, le),
  write: (view, value, offset, le) => view.setFloat64(offset, value, le),
};
