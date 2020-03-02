/* eslint-disable max-classes-per-file, lines-between-class-members */

interface ReadNumber {
  (byteOffset: number): number;
}

interface WriteNumber {
  (value: number, byteOffset: number): number;
}

/**
 * An interface to help build serial protocol schemas.
 */
export interface NumberType {
  readonly byteLength: number;
  readonly read: ReadNumber;
  readonly write: WriteNumber;
}

export const u8: NumberType;
export const u16: NumberType;
export const u32: NumberType;
export const f32: NumberType;
export const u64: NumberType;
export const f64: NumberType;

declare class Binary {
  length: number;
  byteOffset: number;
  raw: Buffer;
  constructor(buffer: Buffer | number, byteOffset?: number);
  toBuffer(): Buffer;
  slice(start?: number, end?: number): Binary;
  insert(source: Buffer, sourceStart: number, sourceEnd: number, jump?: boolean): number;
  write(type: NumberType, value: number): number;
  read(type: NumberType): number;
}

declare class Builder {
  write(type: NumberType, value: number): Builder;
  toBytes(): Array<number>;
  toBuffer(): Buffer;
}
