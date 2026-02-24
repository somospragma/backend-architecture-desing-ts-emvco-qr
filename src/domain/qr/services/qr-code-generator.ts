import {
  getSymbolSize,
  getSymbolTotalCodewords,
  setToSJISFunction,
} from "../infrastructure/qr-utils";
import {
  ErrorCorrectionLevel,
  M as ECLevelM,
  from as ECLevelFrom,
} from "../value-objects/error-correction-level";
import { BitBuffer } from "../infrastructure/bit-buffer";
import { BitMatrix } from "../entities/qr-matrix";
import { AlignmentPattern } from "../infrastructure/alignment-pattern";
import { FinderPattern } from "../infrastructure/finder-pattern";
import * as MaskPattern from "../value-objects/mask-pattern";
import { ErrorCorrectionCode } from "../infrastructure/error-correction-code";
import { ReedSolomonEncoder } from "../infrastructure/reed-solomon-encoder";
import * as Version from "../value-objects/qr-version";
import { FormatInfo } from "../infrastructure/format-info";
import { Mode, getCharCountIndicator } from "../value-objects/encoding-mode";
import * as Segments from "../infrastructure/segments";
import { NumericData } from "../entities/data-segments/numeric-data";
import { AlphanumericData } from "../entities/data-segments/alphanumeric-data";
import { ByteData } from "../entities/data-segments/byte-data";
import { KanjiData } from "../entities/data-segments/kanji-data";

type SegmentType = NumericData | AlphanumericData | ByteData | KanjiData;

class QRCodeGenerator {
  private static isFinderPatternModule(r: number, c: number): boolean {
    return (
      (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
      (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
      (r >= 2 && r <= 4 && c >= 2 && c <= 4)
    );
  }

  private static setupFinderPattern(matrix: BitMatrix, version: number): void {
    const size = matrix.size;
    const pos = FinderPattern.getPositions(version);

    for (const [row, col] of pos) {
      for (let r = -1; r <= 7; r++) {
        if (row + r <= -1 || size <= row + r) continue;

        for (let c = -1; c <= 7; c++) {
          if (col + c <= -1 || size <= col + c) continue;
          matrix.set(row + r, col + c, this.isFinderPatternModule(r, c), true);
        }
      }
    }
  }

  private static setupTimingPattern(matrix: BitMatrix): void {
    const size = matrix.size;

    for (let r = 8; r < size - 8; r++) {
      const value = r % 2 === 0;
      matrix.set(r, 6, value, true);
      matrix.set(6, r, value, true);
    }
  }

  private static setupAlignmentPattern(
    matrix: BitMatrix,
    version: number
  ): void {
    const pos = AlignmentPattern.getPositions(version);

    for (const [row, col] of pos) {
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          if (
            r === -2 ||
            r === 2 ||
            c === -2 ||
            c === 2 ||
            (r === 0 && c === 0)
          ) {
            matrix.set(row + r, col + c, true, true);
          } else {
            matrix.set(row + r, col + c, false, true);
          }
        }
      }
    }
  }

  private static setupVersionInfo(matrix: BitMatrix, version: number): void {
    const size = matrix.size;
    const bits = Version.getEncodedBits(version);
    let row, col, mod;

    for (let i = 0; i < 18; i++) {
      row = Math.floor(i / 3);
      col = (i % 3) + size - 8 - 3;
      mod = ((bits >> i) & 1) === 1;

      matrix.set(row, col, mod, true);
      matrix.set(col, row, mod, true);
    }
  }

  private static setupFormatInfo(
    matrix: BitMatrix,
    errorCorrectionLevel: ErrorCorrectionLevel,
    maskPattern: number
  ): void {
    const size = matrix.size;
    const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);

    for (let i = 0; i < 15; i++) {
      const mod = ((bits >> i) & 1) === 1;

      if (i < 6) {
        matrix.set(i, 8, mod, true);
      } else if (i < 8) {
        matrix.set(i + 1, 8, mod, true);
      } else {
        matrix.set(size - 15 + i, 8, mod, true);
      }

      if (i < 8) {
        matrix.set(8, size - i - 1, mod, true);
      } else if (i < 9) {
        matrix.set(8, 15 - i - 1 + 1, mod, true);
      } else {
        matrix.set(8, 15 - i - 1, mod, true);
      }
    }

    matrix.set(size - 8, 8, 1, true);
  }

  private static processBit(
    matrix: BitMatrix,
    row: number,
    col: number,
    data: Uint8Array,
    state: { byteIndex: number; bitIndex: number }
  ): void {
    if (matrix.isReserved(row, col)) return;

    const dark =
      state.byteIndex < data.length &&
      ((data[state.byteIndex] >>> state.bitIndex) & 1) === 1;

    matrix.set(row, col, dark);
    state.bitIndex--;

    if (state.bitIndex === -1) {
      state.byteIndex++;
      state.bitIndex = 7;
    }
  }

  private static setupData(matrix: BitMatrix, data: Uint8Array): void {
    const size = matrix.size;
    let inc = -1;
    let row = size - 1;
    const state = { byteIndex: 0, bitIndex: 7 };

    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;

      while (true) {
        this.processBit(matrix, row, col, data, state);
        this.processBit(matrix, row, col - 1, data, state);

        row += inc;

        if (row < 0 || size <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  private static createData(
    version: number,
    errorCorrectionLevel: ErrorCorrectionLevel,
    segments: SegmentType[]
  ): Uint8Array {
    const buffer = new BitBuffer();

    segments.forEach((data) => {
      buffer.put(data.mode.bit, 4);
      buffer.put(data.getLength(), getCharCountIndicator(data.mode, version));
      data.write(buffer);
    });

    const totalCodewords = getSymbolTotalCodewords(version);
    const ecTotalCodewords = ErrorCorrectionCode.getTotalCodewordsCount(
      version,
      errorCorrectionLevel
    )!;
    const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;

    if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
      buffer.put(0, 4);
    }

    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(0 as unknown as boolean);
    }

    const remainingByte =
      (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
    for (let i = 0; i < remainingByte; i++) {
      buffer.put(i % 2 ? 0x11 : 0xec, 8);
    }

    return this.createCodewords(buffer, version, errorCorrectionLevel);
  }

  private static createCodewords(
    bitBuffer: BitBuffer,
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

    const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);

    const dataCodewordsInGroup1 = Math.floor(
      dataTotalCodewords / ecTotalBlocks
    );
    const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;

    const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;

    const rs = new ReedSolomonEncoder(ecCount);

    let offset = 0;
    const dcData: Uint8Array[] = new Array(ecTotalBlocks);
    const ecData: Uint8Array[] = new Array(ecTotalBlocks);
    let maxDataSize = 0;
    const buffer = new Uint8Array(bitBuffer.buffer);

    for (let b = 0; b < ecTotalBlocks; b++) {
      const dataSize =
        b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;

      dcData[b] = buffer.slice(offset, offset + dataSize);
      ecData[b] = rs.encode(dcData[b]);

      offset += dataSize;
      maxDataSize = Math.max(maxDataSize, dataSize);
    }

    const data = new Uint8Array(totalCodewords);
    let index = 0;

    for (let i = 0; i < maxDataSize; i++) {
      for (let r = 0; r < ecTotalBlocks; r++) {
        if (i < dcData[r].length) {
          data[index++] = dcData[r][i];
        }
      }
    }

    for (let i = 0; i < ecCount; i++) {
      for (let r = 0; r < ecTotalBlocks; r++) {
        data[index++] = ecData[r][i];
      }
    }

    return data;
  }

  private static createSymbol(
    data: string | (string | { data: string; mode?: Mode })[],
    version: number | undefined,
    errorCorrectionLevel: ErrorCorrectionLevel,
    maskPattern: number | undefined
  ): {
    modules: BitMatrix;
    version: number;
    errorCorrectionLevel: ErrorCorrectionLevel;
    maskPattern: number;
    segments: SegmentType[];
  } {
    let segments: SegmentType[];

    if (Array.isArray(data)) {
      segments = Segments.fromArray(data);
    } else if (typeof data === "string") {
      let estimatedVersion = version;

      if (!estimatedVersion) {
        const rawSegments = Segments.rawSplit(data);
        estimatedVersion = Version.getBestVersionForData(
          rawSegments,
          errorCorrectionLevel
        );
      }

      segments = Segments.fromString(data, estimatedVersion || 40);
    } else {
      throw new TypeError("Data type not supported");
    }

    const bestVersion = Version.getBestVersionForData(
      segments,
      errorCorrectionLevel
    );

    if (!bestVersion) {
      throw new Error("Data exceeds maximum QR code capacity");
    }

    if (!version) {
      version = bestVersion;
    } else if (version < bestVersion) {
      throw new Error(
        `Selected version ${version} is insufficient. Minimum required version: ${bestVersion}`
      );
    }

    const dataBits = this.createData(version, errorCorrectionLevel, segments);

    const moduleCount = getSymbolSize(version);
    const modules = new BitMatrix(moduleCount);

    this.setupFinderPattern(modules, version);
    this.setupTimingPattern(modules);
    this.setupAlignmentPattern(modules, version);

    this.setupFormatInfo(modules, errorCorrectionLevel, 0);

    if (version >= 7) {
      this.setupVersionInfo(modules, version);
    }

    this.setupData(modules, dataBits);

    if (maskPattern === undefined || Number.isNaN(maskPattern)) {
      maskPattern = MaskPattern.getBestMask(
        modules,
        this.setupFormatInfo.bind(this, modules, errorCorrectionLevel)
      );
    }

    MaskPattern.applyMask(maskPattern!, modules);

    this.setupFormatInfo(modules, errorCorrectionLevel, maskPattern!);

    return {
      modules: modules,
      version: version,
      errorCorrectionLevel: errorCorrectionLevel,
      maskPattern: maskPattern!,
      segments: segments,
    };
  }

  static create(
    data: string | (string | { data: string; mode?: Mode })[],
    options?: QRCodeOptions
  ): {
    modules: BitMatrix;
    version: number;
    errorCorrectionLevel: ErrorCorrectionLevel;
    maskPattern: number;
    segments: SegmentType[];
  } {
    if (data === undefined || data === "") {
      throw new Error("Input data is required");
    }

    let errorCorrectionLevel = ECLevelM;
    let version: number | undefined;
    let mask: number | undefined;

    if (options !== undefined) {
      errorCorrectionLevel = ECLevelFrom(
        options.errorCorrectionLevel,
        ECLevelM
      );
      version = Version.from(options.version);
      mask = MaskPattern.from(options.maskPattern);

      if (options.toSJISFunc) {
        setToSJISFunction(options.toSJISFunc);
      }
    }

    return this.createSymbol(data, version, errorCorrectionLevel, mask);
  }
}

export interface QRCodeOptions {
  version?: number;
  errorCorrectionLevel?: string | ErrorCorrectionLevel;
  maskPattern?: number;
  toSJISFunc?: (kanji: string) => number;
}

export default function QrCodeGenerator(
  data: string | (string | { data: string; mode?: Mode })[],
  options?: QRCodeOptions
): {
  modules: BitMatrix;
  version: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  maskPattern: number;
  segments: SegmentType[];
} {
  return QRCodeGenerator.create(data, options);
}
