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

import { Field, FieldInputs } from './types.d';

interface IndexOf<T> {
  [key: string]: T;
  [index: number]: T;
}

export class Schema {
  private indexes: IndexOf<Field> = {};

  constructor(readonly signature: number, readonly name: string, fieldInputs: Array<FieldInputs>) {
    for (let i = 0, len = fieldInputs.length; i < len; i++) {
      const [signature, type, name] = fieldInputs[i]; // eslint-disable-line no-shadow
      const field = { name, type, signature };
      if (Reflect.has(this.indexes, name)) {
        throw new Error(`Attempted to set name '${name}' twice`);
      } else if (Reflect.has(this.indexes, signature)) {
        throw new Error(`Attempted to set signature '${signature}' twice`);
      } else {
        this.indexes[name] = field;
        this.indexes[signature] = field;
      }
      this.indexes[name] = field;
    }
  }

  get(index: string | number): Field | undefined {
    return this.indexes[index];
  }
}
