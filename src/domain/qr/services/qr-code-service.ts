import { BitMatrix } from "../entities/qr-matrix";
import { AlignmentPattern } from "../infrastructure/alignment-pattern";
import { ErrorCorrectionCode } from "../infrastructure/error-correction-code";
import { FormatInfo } from "../infrastructure/format-info";
import { getSymbolTotalCodewords } from "../infrastructure/qr-utils";
import {
  ErrorCorrectionLevel,
  H,
  L,
  M,
  Q,
} from "../value-objects/error-correction-level";
import { getCharCountIndicator } from "../value-objects/encoding-mode";
import QrCodeGenerator from "./qr-code-generator";

export type QRConfig = {
  width?: number;
  content: string;
  version?: number;
  errorCorrectionLevel?: string;
};

export type QRDecodeConfig = {
  genericImage?: boolean;
  size?: number;
};

type DecodedFormatInfo = {
  errorCorrectionLevel: ErrorCorrectionLevel;
  maskPattern: number;
};

type SizeAndPayload = {
  size: number;
  payload: string;
};

export class QRCodeService {
  private static readonly ALPHA_NUM_CHARS =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

  static createBase64(config: QRConfig, genericImage?: boolean): string {
    const defaultConfig = {
      errorCorrectionLevel: config.errorCorrectionLevel ?? "Q",
    };

    const qr = QrCodeGenerator(config.content, {
      ...defaultConfig,
      version: config.version ?? this.getOptimalConfig(config.content).version,
      errorCorrectionLevel:
        config.errorCorrectionLevel ??
        this.getOptimalConfig(config.content).errorCorrectionLevel,
    });
    const { modules } = qr;
    const { size } = modules;

    const bits = this.modulesToBits(modules, size);
    const bytes = this.bitsToBytes(bits);
    const base64 = Buffer.from(bytes).toString("base64");

    return genericImage ? base64 : `${size}${base64}`;
  }

  static decodeBase64(input: string, config: QRDecodeConfig = {}): string {
    const { size, payload } = this.resolveSizeAndPayload(input, config);
    const matrix = this.base64ToMatrix(payload, size);
    const version = (size - 17) / 4;
    const formatInfo = this.decodeFormatInfo(matrix);
    const reserved = this.createReservedMatrix(version, size);
    const codewords = this.readCodewords(matrix, reserved, formatInfo.maskPattern);
    const dataCodewords = this.extractDataCodewords(
      codewords,
      version,
      formatInfo.errorCorrectionLevel
    );

    return this.decodeSegments(dataCodewords, version);
  }

  private static getOptimalConfig(content: string): {
    version?: number;
    errorCorrectionLevel: string;
  } {
    const length = content.length;

    if (length <= 230) return { version: 15, errorCorrectionLevel: "H" };
    if (length <= 298) return { version: 15, errorCorrectionLevel: "Q" };
    if (length <= 418) return { version: 15, errorCorrectionLevel: "M" };
    if (length <= 600) return { version: 15, errorCorrectionLevel: "L" };

    return { version: undefined, errorCorrectionLevel: "Q" };
  }

  private static modulesToBits(modules: BitMatrix, size: number): number[] {
    const bits: number[] = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        bits.push(modules.get(x, y) ? 0 : 1);
      }
    }

    return bits;
  }

  private static bitsToBytes(bits: number[]): number[] {
    const bytes: number[] = [];

    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        byte <<= 1;
        if (i + j < bits.length) {
          byte |= bits[i + j];
        }
      }
      bytes.push(byte);
    }

    return bytes;
  }

  private static resolveSizeAndPayload(
    input: string,
    config: QRDecodeConfig
  ): SizeAndPayload {
    const normalized = input.trim();

    if (config.genericImage) {
      if (!config.size) {
        throw new Error("QR size is required when decoding generic base64");
      }

      this.assertValidSize(config.size);
      return { size: config.size, payload: normalized };
    }

    for (const prefixLength of [2, 3]) {
      const maybeSize = Number.parseInt(normalized.slice(0, prefixLength), 10);
      if (!this.isValidSize(maybeSize)) continue;

      const payload = normalized.slice(prefixLength);
      const bytes = Buffer.from(payload, "base64");
      const expectedBytes = Math.ceil((maybeSize * maybeSize) / 8);

      if (bytes.length === expectedBytes) {
        return { size: maybeSize, payload };
      }
    }

    throw new Error("Invalid QR base64 format");
  }

  private static assertValidSize(size: number): void {
    if (!this.isValidSize(size)) {
      throw new Error("QR size must match a valid QR version");
    }
  }

  private static isValidSize(size: number): boolean {
    const version = (size - 17) / 4;
    return Number.isInteger(version) && version >= 1 && version <= 40;
  }

  private static base64ToMatrix(payload: string, size: number): BitMatrix {
    const bytes = Buffer.from(payload, "base64");
    const expectedBytes = Math.ceil((size * size) / 8);

    if (bytes.length !== expectedBytes) {
      throw new Error("QR base64 payload length does not match QR size");
    }

    const matrix = new BitMatrix(size);
    let bitIndex = 0;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const byte = bytes[Math.floor(bitIndex / 8)];
        const bit = (byte >> (7 - (bitIndex % 8))) & 1;
        matrix.set(x, y, bit === 0);
        bitIndex++;
      }
    }

    return matrix;
  }

  private static decodeFormatInfo(matrix: BitMatrix): DecodedFormatInfo {
    const encodedBits = this.readFormatBits(matrix);
    const levels = [L, M, Q, H];
    let best: DecodedFormatInfo | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const errorCorrectionLevel of levels) {
      for (let maskPattern = 0; maskPattern <= 7; maskPattern++) {
        const candidate = FormatInfo.getEncodedBits(
          errorCorrectionLevel,
          maskPattern
        );
        const distance = this.hammingDistance(encodedBits, candidate);

        if (distance < bestDistance) {
          bestDistance = distance;
          best = { errorCorrectionLevel, maskPattern };
        }
      }
    }

    if (!best || bestDistance > 3) {
      throw new Error("Unable to decode QR format information");
    }

    return best;
  }

  private static readFormatBits(matrix: BitMatrix): number {
    const size = matrix.size;
    let bits = 0;

    for (let i = 0; i < 15; i++) {
      let row: number;
      let col: number;

      if (i < 6) {
        row = i;
        col = 8;
      } else if (i < 8) {
        row = i + 1;
        col = 8;
      } else {
        row = size - 15 + i;
        col = 8;
      }

      if (matrix.get(row, col)) bits |= 1 << i;
    }

    return bits;
  }

  private static hammingDistance(a: number, b: number): number {
    let value = a ^ b;
    let distance = 0;

    while (value) {
      distance += value & 1;
      value >>>= 1;
    }

    return distance;
  }

  private static createReservedMatrix(version: number, size: number): BitMatrix {
    const reserved = new BitMatrix(size);

    this.reserveFinderPattern(reserved, 0, 0);
    this.reserveFinderPattern(reserved, size - 7, 0);
    this.reserveFinderPattern(reserved, 0, size - 7);
    this.reserveTimingPatterns(reserved);
    this.reserveAlignmentPatterns(reserved, version);
    this.reserveFormatInfo(reserved);

    if (version >= 7) {
      this.reserveVersionInfo(reserved);
    }

    return reserved;
  }

  private static reserveFinderPattern(
    matrix: BitMatrix,
    row: number,
    col: number
  ): void {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || matrix.size <= row + r) continue;

      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || matrix.size <= col + c) continue;
        matrix.set(row + r, col + c, 1, true);
      }
    }
  }

  private static reserveTimingPatterns(matrix: BitMatrix): void {
    for (let i = 8; i < matrix.size - 8; i++) {
      matrix.set(i, 6, 1, true);
      matrix.set(6, i, 1, true);
    }
  }

  private static reserveAlignmentPatterns(matrix: BitMatrix, version: number): void {
    for (const [row, col] of AlignmentPattern.getPositions(version)) {
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          matrix.set(row + r, col + c, 1, true);
        }
      }
    }
  }

  private static reserveFormatInfo(matrix: BitMatrix): void {
    const size = matrix.size;

    for (let i = 0; i < 15; i++) {
      if (i < 6) {
        matrix.set(i, 8, 1, true);
      } else if (i < 8) {
        matrix.set(i + 1, 8, 1, true);
      } else {
        matrix.set(size - 15 + i, 8, 1, true);
      }

      if (i < 8) {
        matrix.set(8, size - i - 1, 1, true);
      } else if (i < 9) {
        matrix.set(8, 15 - i, 1, true);
      } else {
        matrix.set(8, 15 - i - 1, 1, true);
      }
    }

    matrix.set(size - 8, 8, 1, true);
  }

  private static reserveVersionInfo(matrix: BitMatrix): void {
    const size = matrix.size;

    for (let i = 0; i < 18; i++) {
      const row = Math.floor(i / 3);
      const col = (i % 3) + size - 11;

      matrix.set(row, col, 1, true);
      matrix.set(col, row, 1, true);
    }
  }

  private static readCodewords(
    matrix: BitMatrix,
    reserved: BitMatrix,
    maskPattern: number
  ): Uint8Array {
    const bits: number[] = [];
    const size = matrix.size;
    let inc = -1;
    let row = size - 1;

    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;

      while (true) {
        this.readDataModule(matrix, reserved, maskPattern, row, col, bits);
        this.readDataModule(matrix, reserved, maskPattern, row, col - 1, bits);

        row += inc;

        if (row < 0 || size <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }

    return Uint8Array.from(this.bitsToBytes(bits));
  }

  private static readDataModule(
    matrix: BitMatrix,
    reserved: BitMatrix,
    maskPattern: number,
    row: number,
    col: number,
    bits: number[]
  ): void {
    if (reserved.isReserved(row, col)) return;

    const unmasked = matrix.get(row, col) ^ (this.getMaskAt(maskPattern, row, col) ? 1 : 0);
    bits.push(unmasked);
  }

  private static extractDataCodewords(
    codewords: Uint8Array,
    version: number,
    errorCorrectionLevel: ErrorCorrectionLevel
  ): Uint8Array {
    const totalCodewords = getSymbolTotalCodewords(version);
    const ecTotalCodewords = ErrorCorrectionCode.getTotalCodewordsCount(
      version,
      errorCorrectionLevel
    )!;
    const dataTotalCodewords = totalCodewords - ecTotalCodewords;
    const ecTotalBlocks = ErrorCorrectionCode.getBlocksCount(
      version,
      errorCorrectionLevel
    )!;
    const blocksInGroup2 = totalCodewords % ecTotalBlocks;
    const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
    const dataCodewordsInGroup1 = Math.floor(
      dataTotalCodewords / ecTotalBlocks
    );
    const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
    const blockLengths = Array.from({ length: ecTotalBlocks }, (_, index) =>
      index < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2
    );
    const blocks = blockLengths.map((length) => new Uint8Array(length));
    const maxDataSize = Math.max(...blockLengths);
    let codewordIndex = 0;

    for (let i = 0; i < maxDataSize; i++) {
      for (let block = 0; block < ecTotalBlocks; block++) {
        if (i < blockLengths[block]) {
          blocks[block][i] = codewords[codewordIndex++];
        }
      }
    }

    const dataCodewords = new Uint8Array(dataTotalCodewords);
    let offset = 0;

    for (const block of blocks) {
      dataCodewords.set(block, offset);
      offset += block.length;
    }

    return dataCodewords;
  }

  private static decodeSegments(dataCodewords: Uint8Array, version: number): string {
    const reader = new QRBitReader(dataCodewords);
    const chunks: string[] = [];

    while (reader.available() >= 4) {
      const mode = reader.read(4);
      if (mode === 0) break;

      switch (mode) {
        case 1:
          chunks.push(this.decodeNumericSegment(reader, version));
          break;
        case 2:
          chunks.push(this.decodeAlphanumericSegment(reader, version));
          break;
        case 4:
          chunks.push(this.decodeByteSegment(reader, version));
          break;
        default:
          throw new Error(`Unsupported QR encoding mode: ${mode}`);
      }
    }

    return chunks.join("");
  }

  private static decodeNumericSegment(
    reader: QRBitReader,
    version: number
  ): string {
    const length = reader.read(getCharCountIndicator({ bit: 1, ccBits: [10, 12, 14] }, version));
    let value = "";
    let remaining = length;

    while (remaining >= 3) {
      value += reader.read(10).toString().padStart(3, "0");
      remaining -= 3;
    }

    if (remaining === 2) {
      value += reader.read(7).toString().padStart(2, "0");
    } else if (remaining === 1) {
      value += reader.read(4).toString();
    }

    return value;
  }

  private static decodeAlphanumericSegment(
    reader: QRBitReader,
    version: number
  ): string {
    const length = reader.read(getCharCountIndicator({ bit: 2, ccBits: [9, 11, 13] }, version));
    let value = "";
    let remaining = length;

    while (remaining >= 2) {
      const code = reader.read(11);
      value += this.ALPHA_NUM_CHARS[Math.floor(code / 45)];
      value += this.ALPHA_NUM_CHARS[code % 45];
      remaining -= 2;
    }

    if (remaining === 1) {
      value += this.ALPHA_NUM_CHARS[reader.read(6)];
    }

    return value;
  }

  private static decodeByteSegment(reader: QRBitReader, version: number): string {
    const length = reader.read(getCharCountIndicator({ bit: 4, ccBits: [8, 16, 16] }, version));
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      bytes[i] = reader.read(8);
    }

    return new TextDecoder().decode(bytes);
  }

  private static getMaskAt(maskPattern: number, i: number, j: number): boolean {
    switch (maskPattern) {
      case 0:
        return (i + j) % 2 === 0;
      case 1:
        return i % 2 === 0;
      case 2:
        return j % 3 === 0;
      case 3:
        return (i + j) % 3 === 0;
      case 4:
        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case 5:
        return ((i * j) % 2) + ((i * j) % 3) === 0;
      case 6:
        return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
      case 7:
        return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
      default:
        throw new Error(`Invalid mask pattern value: ${maskPattern}`);
    }
  }
}

class QRBitReader {
  private offset = 0;

  constructor(private readonly bytes: Uint8Array) {}

  available(): number {
    return this.bytes.length * 8 - this.offset;
  }

  read(length: number): number {
    if (length > this.available()) {
      throw new Error("Unexpected end of QR data");
    }

    let value = 0;

    for (let i = 0; i < length; i++) {
      const byte = this.bytes[Math.floor(this.offset / 8)];
      value = (value << 1) | ((byte >> (7 - (this.offset % 8))) & 1);
      this.offset++;
    }

    return value;
  }
}
