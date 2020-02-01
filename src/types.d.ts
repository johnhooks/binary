/**
 * Author: John Hooks
 * URL: https://github.com/johnhooks/binary
 * Version: 0.2.1
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
  constructor(buffer: Buffer | number, byteOffset?);
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
