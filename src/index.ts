/**
 * Author: John Hooks
 * URL: https://github.com/johnhooks/binary
 * Version: 0.1.0
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

import { NumberType } from "./NumberType";

/**
 * A Node.js Buffer Wrapper.
 * Intended for serializing/deserializing data using a predefined schema.
 */
export class Binary {
  private _buffer: Buffer;
  private _byteOffset: number;

  /**
   * @param buffer Either a Buffer or the byte length with which to create a buffer.
   * @param byteOffset Optionally, if a buffer is provided, initialize `Binary#_byteOffset`
   * to `byteOffset`.
   */
  constructor(buffer: Buffer | number, byteOffset: number = 0) {
    if (buffer instanceof Buffer) {
      if (!(byteOffset < buffer.length) || byteOffset < 0) {
        throw new RangeError(
          "Provide byteOffset is not within the range of the buffer"
        );
      }
      this._buffer = buffer.slice(byteOffset, buffer.length); // Create a new view
      this._byteOffset = 0;
    } else {
      this._buffer = Buffer.alloc(buffer);
      this._byteOffset = 0;
    }
  }

  /**
   * I am unsure whether or not this is useful.
   * @returns The length of the wrapped buffer.
   */
  get length(): number {
    return this._buffer.length;
  }

  /**
   * @returns The current offset in the wrapped buffer.
   */
  get byteOffset(): number {
    return this._byteOffset;
  }

  /**
   * Set the current offset to `value`.
   */
  set byteOffset(value: number) {
    this._byteOffset = value;
    if (!(this._byteOffset < this._buffer.length) || this._byteOffset < 0) {
      throw new RangeError("Attempt to seek beyond buffer range");
    }
  }

  /**
   * @returns The raw buffer.
   */
  get raw(): Buffer {
    return this._buffer;
  }

  /**
   * @returns A new Buffer view from the wrapped buffer, from 0 to the current offset.
   */
  toBuffer(): Buffer {
    return this._buffer.slice(0, this._byteOffset);
  }

  /**
   * @param start The position to begin the slice. Default is 0.
   * @param end The position to end the slice (not inclusive). Default is the wrapped
   * buffer's length.
   * @returns A new Binary view of the wrapped buffer.
   */
  slice(start = 0, end = this._buffer.length): Binary {
    return new Binary(this._buffer.slice(start, end));
  }

  /**
   * Insert the contents of another buffer into the wrapped buffer starting at the current offset.
   * @param source The buffer from which to copy.
   * @param sourceStart The offset within `source` from which to begin copying.
   * @param sourceEnd The offset within `source` from which to stop copying (not inclucive).
   * @param jump Whether or not to adjust the offset to the end position of the insert.
   * @returns The end position of the insert.
   */
  insert(
    source: Buffer,
    sourceStart: number,
    sourceEnd: number,
    jump: boolean = false
  ): number {
    const byteCount = source.copy(
      this._buffer,
      this._byteOffset,
      sourceStart,
      sourceEnd
    );
    if (jump) return (this.byteOffset += byteCount);
    return this.byteOffset + byteCount;
  }

  /**
   * @param type The [[NumberType]] of `value`.
   * @param value The value to be written to the buffer
   * @returns The current offset of the buffer after the write
   */
  write(type: NumberType, value: number): number {
    this._byteOffset = type.write.call(this._buffer, value, this._byteOffset);
    return this._byteOffset;
  }

  /**
   * @param type The [[NumberType]] to read from the buffer.
   * @returns The value read from the buffer.
   */
  read(type: NumberType) {
    const value = type.read.call(this._buffer, this._byteOffset);
    this._byteOffset += type.byteLength;
    return value;
  }
}
