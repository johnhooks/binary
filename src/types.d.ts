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

export type FieldInputs = [number, NumberType, string];

export interface Field {
  readonly name: string;
  readonly type: NumberType;
  readonly signature: number;
}

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

declare class Schema {
  readonly signature: number;
  readonly name: string;
  constructor(signature: number, name: string, fieldInputs: Array<FieldInputs>);
  get(index: string | number): Field | undefined;
}
