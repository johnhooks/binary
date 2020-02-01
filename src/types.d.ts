/* eslint-disable max-classes-per-file */
interface ReadNumber {
  (byteOffset: number): number;
}

interface WriteNumber {
  (value: number, byteOffset: number): number;
}

/**
 * An interface to help build serial protocol schemas.
 */
/* eslint-disable lines-between-class-members */

export interface NumberType {
  readonly byteLength: number;
  readonly read: ReadNumber;
  readonly write: WriteNumber;
}

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
  constructor(buffer: Buffer | number, byteOffset?);
  toBuffer(): Buffer;
  slice(start?: number, end?: number): Binary;
  insert(source: Buffer, sourceStart: number, sourceEnd: number, jump?: boolean): number;
  write(type: NumberType, value: number): number;
  read(type: NumberType): void;
}

declare class Schema {
  readonly signature: number;
  readonly name: string;
  constructor(signature: number, name: string, fieldInputs: Array<FieldInputs>);
  get(index: string | number): Field | undefined;
}
