import type { NumberType } from './NumberType';

/**
 * An ArrayBuffer wrapper.
 * Intended for serializing/de-serializing data using a predefined schema.
 */
export class Binary {
  #buffer: ArrayBuffer;
  #view: DataView;
  #byteOffset: number;

  /**
   * @param buffer Either an ArrayBuffer or the byte length with which to create one.
   * @param byteOffset Optionally, if an ArrayBuffer is provided, initialize the view
   * starting at `byteOffset`.
   */
  constructor(buffer: ArrayBuffer | number, byteOffset = 0) {
    if (buffer instanceof ArrayBuffer) {
      if (byteOffset < 0 || byteOffset >= buffer.byteLength) {
        throw new RangeError('Provided byteOffset is not within the range of the buffer');
      }
      this.#buffer = buffer;
      this.#view = new DataView(buffer, byteOffset);
      this.#byteOffset = 0;
    } else {
      this.#buffer = new ArrayBuffer(buffer);
      this.#view = new DataView(this.#buffer);
      this.#byteOffset = 0;
    }
  }

  /**
   * @returns The length of the wrapped buffer.
   */
  get length(): number {
    return this.#view.byteLength;
  }

  /**
   * @returns The current offset in the wrapped buffer.
   */
  get byteOffset(): number {
    return this.#byteOffset;
  }

  /**
   * Set the current offset to `value`.
   */
  set byteOffset(value: number) {
    if (value < 0 || value >= this.#view.byteLength) {
      throw new RangeError('Attempt to seek beyond buffer range');
    }
    this.#byteOffset = value;
  }

  /**
   * @returns The underlying ArrayBuffer.
   */
  get raw(): ArrayBuffer {
    return this.#buffer;
  }

  /**
   * @returns A new ArrayBuffer containing bytes from 0 to the current offset.
   */
  toArrayBuffer(): ArrayBuffer {
    return this.#buffer.slice(0, this.#byteOffset);
  }

  /**
   * @returns A Uint8Array view from 0 to the current offset.
   */
  toUint8Array(): Uint8Array {
    return new Uint8Array(this.#buffer, 0, this.#byteOffset);
  }

  /**
   * @param start The position to begin the slice. Default is 0.
   * @param end The position to end the slice (not inclusive). Default is the
   * wrapped buffer's length.
   * @returns A new Binary wrapping a copy of the sliced region.
   */
  slice(start = 0, end = this.#view.byteLength): Binary {
    return new Binary(this.#buffer.slice(start, end));
  }

  /**
   * Insert the contents of a Uint8Array into the wrapped buffer starting at the current offset.
   * @param source The source to copy from.
   * @param sourceStart The offset within `source` from which to begin copying.
   * @param sourceEnd The offset within `source` from which to stop copying (not inclusive).
   * @param jump Whether or not to adjust the offset to the end position of the insert.
   * @returns The end position of the insert.
   */
  insert(source: Uint8Array, sourceStart: number, sourceEnd: number, jump = false): number {
    const target = new Uint8Array(this.#buffer);
    const chunk = source.subarray(sourceStart, sourceEnd);
    target.set(chunk, this.#byteOffset);
    const byteCount = chunk.byteLength;
    if (jump) {
      this.#byteOffset += byteCount;
      return this.#byteOffset;
    }
    return this.#byteOffset + byteCount;
  }

  /**
   * @param type The NumberType of `value`.
   * @param value The value to be written to the buffer.
   * @returns The current offset of the buffer after the write.
   */
  write(type: NumberType, value: number): number {
    type.write(this.#view, value, this.#byteOffset);
    this.#byteOffset += type.byteLength;
    return this.#byteOffset;
  }

  /**
   * @param type The NumberType to read from the buffer.
   * @returns The value read from the buffer.
   */
  read(type: NumberType): number {
    const value = type.read(this.#view, this.#byteOffset);
    this.#byteOffset += type.byteLength;
    return value;
  }
}
