import * as Mode from "../../value-objects/encoding-mode";
import { BitBuffer } from "../../infrastructure/bit-buffer";

export class ByteData {
  mode: Mode.Mode;
  data: Uint8Array;

  constructor(data: string | Uint8Array) {
    this.mode = Mode.BYTE;
    if (typeof data === "string") {
      this.data = new TextEncoder().encode(data);
    } else {
      this.data = new Uint8Array(data);
    }
  }

  static getBitsLength(length: number): number {
    return length * 8;
  }

  getLength(): number {
    return this.data.length;
  }

  getBitsLength(): number {
    return ByteData.getBitsLength(this.data.length);
  }

  write(bitBuffer: BitBuffer): void {
    for (let i = 0, l = this.data.length; i < l; i++) {
      bitBuffer.put(this.data[i], 8);
    }
  }
}
