import { NumberType } from './types.d';

export type Data = [NumberType, number];

/**
 * A Node.js Buffer Builder using NumberType.
 * Constructs an array of (NumberType, number) tuples, which can be converted
 * to an array of bytes or a buffer.
 */
export class Builder {
  private byteLength = 0;
  private data: Array<Data> = [];

  /**
   * @param {NumberType} type The number type of `value`.
   * @param {number} value - The value to be written to the buffer
   * @returns {Builder} this - The current offset of the buffer after the write
   */
  write(type: NumberType, value: number): Builder {
    this.data.push([type, value]);
    this.byteLength += type.byteLength;
    return this;
  }

  /**
   * @returns {Array<number>} An array of bytes built using the data written to the Builder.
   */
  toBytes(): Array<number> {
    const bytes: Array<number> = [];
    const buffer = Buffer.alloc(8);

    for (let i = 0, len = this.data.length; i < len; i++) {
      const [type, value] = this.data[i];
      type.write.call(buffer, value, 0);
      for (let j = 0, len = type.byteLength; j < len; j++) {
        bytes.push(buffer.readUInt8(j));
      }
    }

    return bytes;
  }

  /**
   * @returns {Buffer} A Buffer built using the data written to the Builder.
   */
  toBuffer(): Buffer {
    const buffer = Buffer.alloc(this.byteLength);
    let byteOffset = 0;

    for (let i = 0, len = this.data.length; i < len; i++) {
      const [type, value] = this.data[i];
      type.write.call(buffer, value, byteOffset);
      byteOffset += type.byteLength;
    }

    return buffer;
  }
}
