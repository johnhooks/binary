import type { NumberType } from './NumberType';

export type Data = [NumberType, number];

/**
 * An ArrayBuffer Builder using NumberType.
 * Constructs an array of (NumberType, number) tuples, which can be converted
 * to an array of bytes or an ArrayBuffer.
 */
class BaseBuilder {
  #byteLength = 0;
  #data: Array<Data> = [];
  #transferred = false;
  #littleEndian: boolean;

  constructor(littleEndian: boolean) {
    this.#littleEndian = littleEndian;
  }

  #assertNotTransferred(): void {
    if (this.#transferred) {
      throw new Error('Builder has been transferred and can no longer be used');
    }
  }

  /**
   * @param type The number type of `value`.
   * @param value The value to be written to the buffer.
   * @returns this
   */
  write(type: NumberType, value: number): this {
    this.#assertNotTransferred();
    this.#data.push([type, value]);
    this.#byteLength += type.byteLength;
    return this;
  }

  /**
   * @returns An array of bytes built using the data written to the Builder.
   */
  toBytes(): Array<number> {
    this.#assertNotTransferred();
    const bytes: Array<number> = [];
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);

    for (const [type, value] of this.#data) {
      type.write(view, value, 0, this.#littleEndian);
      const u8view = new Uint8Array(buffer, 0, type.byteLength);
      for (const byte of u8view) {
        bytes.push(byte);
      }
    }

    return bytes;
  }

  /**
   * @returns A Uint8Array built using the data written to the Builder.
   */
  toUint8Array(): Uint8Array {
    this.#assertNotTransferred();
    return new Uint8Array(this.toArrayBuffer());
  }

  /**
   * @returns An ArrayBuffer built using the data written to the Builder.
   */
  toArrayBuffer(): ArrayBuffer {
    this.#assertNotTransferred();
    const buffer = new ArrayBuffer(this.#byteLength);
    const view = new DataView(buffer);
    let byteOffset = 0;

    for (const [type, value] of this.#data) {
      type.write(view, value, byteOffset, this.#littleEndian);
      byteOffset += type.byteLength;
    }

    return buffer;
  }

  /**
   * Builds the ArrayBuffer and transfers it, making this Builder unusable.
   * The returned buffer is ready for postMessage transfer lists.
   * @returns A transferable ArrayBuffer.
   */
  toTransferable(): ArrayBuffer {
    this.#assertNotTransferred();
    const buffer = this.toArrayBuffer();
    this.#transferred = true;
    return buffer.transfer();
  }
}

/**
 * Little-endian ArrayBuffer Builder.
 */
export class Builder extends BaseBuilder {
  constructor() {
    super(true);
  }
}

/**
 * Big-endian ArrayBuffer Builder.
 */
export class BigEndianBuilder extends BaseBuilder {
  constructor() {
    super(false);
  }
}
