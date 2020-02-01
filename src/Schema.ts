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
