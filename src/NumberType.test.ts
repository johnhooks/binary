import { describe, test, expect } from 'vitest';
import { u64 } from './NumberType';

describe('u64', () => {
  test('throws RangeError when value exceeds MAX_SAFE_INTEGER', () => {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    // Write a value larger than MAX_SAFE_INTEGER
    view.setBigUint64(0, BigInt(2) ** BigInt(53), true);
    expect(() => u64.read(view, 0)).toThrow(RangeError);
  });
});
