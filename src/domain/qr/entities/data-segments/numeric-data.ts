import * as Mode from "../../value-objects/encoding-mode";
import { BitBuffer } from "../../infrastructure/bit-buffer";

export class NumericData {
  mode: Mode.Mode;
  data: string;

  constructor(data: string | number) {
    this.mode = Mode.NUMERIC;
    this.data = data.toString();
  }

  static getBitsLength(length: number): number {
    return (
      10 * Math.floor(length / 3) + (length % 3 ? (length % 3) * 3 + 1 : 0)
    );
  }

  getLength(): number {
    return this.data.length;
  }

  getBitsLength(): number {
    return NumericData.getBitsLength(this.data.length);
  }

  write(bitBuffer: BitBuffer): void {
    let i: number;
    let group: string;
    let value: number;

    for (i = 0; i + 3 <= this.data.length; i += 3) {
      group = this.data.substring(i, i + 3);
      value = Number.parseInt(group, 10);

      bitBuffer.put(value, 10);
    }

    const remainingNum = this.data.length - i;
    if (remainingNum > 0) {
      group = this.data.substring(i);
      value = Number.parseInt(group, 10);

      bitBuffer.put(value, remainingNum * 3 + 1);
    }
  }
}
