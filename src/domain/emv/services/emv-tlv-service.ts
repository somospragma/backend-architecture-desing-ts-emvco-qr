import { QRCodeService, QRConfig, QRDecodeConfig } from "../../qr/services/qr-code-service";

export interface TLVNode {
  tag: string;
  length: number;
  value?: string;
  subtags?: TLVSubTag[];
}

interface TLVSubTag {
  tag: string;
  length: number;
  value: string;
}

export class EMVTLVService {
  static parse(input: string): TLVNode[] {
    const result: TLVNode[] = [];
    let offset = 0;

    while (offset < input.length) {
      const tag = input.slice(offset, offset + 2);
      offset += 2;

      const lengthStr = input.slice(offset, offset + 2);
      const length = Number.parseInt(lengthStr, 10);
      offset += 2;

      if (Number.isNaN(length)) {
        throw new TypeError(`Invalid length for tag ${tag}`);
      }

      const value = input.slice(offset, offset + length);
      offset += length;

      if (value.length !== length) {
        throw new Error(`Length mismatch on tag ${tag}`);
      }

      const node: TLVNode = { tag, length };

      const subtags = this.tryParseSubTLV(value);
      if (subtags) {
        node.subtags = subtags;
      } else {
        node.value = value;
      }

      result.push(node);
    }

    return result;
  }

  static parseBase64(input: string, config?: QRDecodeConfig): TLVNode[] {
    return this.parse(QRCodeService.decodeBase64(input, config));
  }

  static stringify(nodes: TLVNode[]): string {
    return nodes.map((node) => this.stringifyNode(node)).join("");
  }

  static toBase64(
    input: string | TLVNode[],
    config: Omit<QRConfig, "content"> = {},
    genericImage?: boolean
  ): string {
    const content = typeof input === "string" ? input : this.stringify(input);

    return QRCodeService.createBase64(
      {
        ...config,
        content,
      },
      genericImage
    );
  }

  private static tryParseSubTLV(value: string): TLVSubTag[] | null {
    const subtags: TLVSubTag[] = [];
    let offset = 0;

    while (offset < value.length) {
      if (offset + 4 > value.length) return null;

      const tag = value.slice(offset, offset + 2);
      const lengthStr = value.slice(offset + 2, offset + 4);
      const length = Number.parseInt(lengthStr, 10);

      if (Number.isNaN(length)) return null;

      const totalSize = 2 + 2 + length;
      if (offset + totalSize > value.length) return null;

      const v = value.slice(offset + 4, offset + 4 + length);
      if (v.length !== length) return null;

      subtags.push({
        tag,
        length,
        value: v,
      });

      offset += totalSize;
    }

    return offset === value.length ? subtags : null;
  }

  private static stringifyNode(node: TLVNode): string {
    const value = node.subtags
      ? node.subtags.map((subtag) => this.stringifySubTag(subtag)).join("")
      : node.value ?? "";

    return `${node.tag}${value.length.toString().padStart(2, "0")}${value}`;
  }

  private static stringifySubTag(subtag: TLVSubTag): string {
    return `${subtag.tag}${subtag.value.length
      .toString()
      .padStart(2, "0")}${subtag.value}`;
  }
}
