/**
 * Author: John Hooks
 * URL: https://github.com/johnhooks/binary
 * Version: 0.2.0
 *
 * This file is part of Binary.
 *
 * Binary is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Binary is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Binary.  If not, see <http://www.gnu.org/licenses/>.
 */

import { NumberType } from './types.d';

/**
 * An Unsigned 8 Bit Integer
 */
export const u8: NumberType = {
  byteLength: 1,
  read: Buffer.prototype.readUInt8,
  write: Buffer.prototype.writeUInt8,
};

/**
 * An Unsigned 16 Bit Integer
 */
export const u16: NumberType = {
  byteLength: 2,
  read: Buffer.prototype.readUInt16LE,
  write: Buffer.prototype.writeUInt16LE,
};

/**
 * An Unsigned 32 Bit Integer
 */
export const u32: NumberType = {
  byteLength: 4,
  read: Buffer.prototype.readUInt32LE,
  write: Buffer.prototype.writeUInt32LE,
};

/**
 * An Unsigned 64 Bit Integer
 *
 * Consider using BigInt.
 */
export const u64: NumberType = {
  byteLength: 8,

  /* readUInt64LE */
  read(this: Buffer, byteOffset: number): number {
    const left = this.readUInt32LE(byteOffset);
    const right = this.readUInt32LE(byteOffset + 4);
    const number = left + right * 2 ** 32; // combine the two 32-bit values
    if (!Number.isSafeInteger(number)) {
      console.warn(number, 'exceeds MAX_SAFE_INTEGER.');
    }
    return number;
  },
  /* writeUInt64LE */
  write(this: Buffer, value: number, byteOffset: number): number {
    return this.writeBigUInt64LE(BigInt(value), byteOffset);
  },
};

/**
 * A 32 Bit Floating Point Number
 */
export const f32: NumberType = {
  byteLength: 4,
  read: Buffer.prototype.readFloatLE,
  write: Buffer.prototype.writeFloatLE,
};

/**
 * A 64 Bit Floating Point Number
 */
export const f64: NumberType = {
  byteLength: 8,
  read: Buffer.prototype.readDoubleLE,
  write: Buffer.prototype.writeDoubleLE,
};
