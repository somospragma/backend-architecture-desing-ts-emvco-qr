import { getSymbolTotalCodewords, getBCHDigit, isValid } from "../infrastructure/qr-utils";
import { ErrorCorrectionCode } from "../infrastructure/error-correction-code";
import { ErrorCorrectionLevel, M as ECLevelM, from as ECLevelFrom } from "./error-correction-level";
import { Mode, BYTE, MIXED, NUMERIC, ALPHANUMERIC, KANJI, getCharCountIndicator } from "./encoding-mode";

const G18 =
  (1 << 12) |
  (1 << 11) |
  (1 << 10) |
  (1 << 9) |
  (1 << 8) |
  (1 << 5) |
  (1 << 2) |
  (1 << 0);
const G18_BCH = getBCHDigit(G18);

interface Segment {
  mode: Mode;
  getLength(): number;
  getBitsLength(): number;
}

function getBestVersionForDataLength(
  mode: Mode,
  length: number,
  errorCorrectionLevel: ErrorCorrectionLevel
): number | undefined {
  for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
    if (length <= getCapacity(currentVersion, errorCorrectionLevel, mode)) {
      return currentVersion;
    }
  }
  return undefined;
}

function getReservedBitsCount(mode: Mode, version: number): number {
  return getCharCountIndicator(mode, version) + 4;
}

function getTotalBitsFromDataArray(
  segments: Segment[],
  version: number
): number {
  let totalBits = 0;

  segments.forEach((data) => {
    const reservedBits = getReservedBitsCount(data.mode, version);
    totalBits += reservedBits + data.getBitsLength();
  });

  return totalBits;
}

function getBestVersionForMixedData(
  segments: Segment[],
  errorCorrectionLevel: ErrorCorrectionLevel
): number | undefined {
  for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
    const length = getTotalBitsFromDataArray(segments, currentVersion);
    if (length <= getCapacity(currentVersion, errorCorrectionLevel, MIXED)) {
      return currentVersion;
    }
  }
  return undefined;
}

export function from(value: any, defaultValue?: number): number | undefined {
  const parsed = parseInt(String(value), 10);
  if (isValid(parsed)) {
    return parsed;
  }
  return defaultValue;
}

export function getCapacity(
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel,
  mode?: Mode
): number {
  if (!isValid(version)) {
    throw new Error("QR version must be between 1 and 40");
  }

  if (mode === undefined) mode = BYTE;

  const totalCodewords = getSymbolTotalCodewords(version);
  const ecTotalCodewords = ErrorCorrectionCode.getTotalCodewordsCount(
    version,
    errorCorrectionLevel
  )!;
  const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;

  if (mode === MIXED) return dataTotalCodewordsBits;

  const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);

  switch (mode) {
    case NUMERIC:
      return Math.floor((usableBits / 10) * 3);
    case ALPHANUMERIC:
      return Math.floor((usableBits / 11) * 2);
    case KANJI:
      return Math.floor(usableBits / 13);
    case BYTE:
    default:
      return Math.floor(usableBits / 8);
  }
}

export function getBestVersionForData(
  data: Segment | Segment[],
  errorCorrectionLevel: ErrorCorrectionLevel
): number | undefined {
  let seg: Segment;

  const ecl = ECLevelFrom(errorCorrectionLevel, ECLevelM);

  if (Array.isArray(data)) {
    if (data.length > 1) {
      return getBestVersionForMixedData(data, ecl);
    }

    if (data.length === 0) {
      return 1;
    }

    seg = data[0];
  } else {
    seg = data;
  }

  return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
}

export function getEncodedBits(version: number): number {
  if (!isValid(version) || version < 7) {
    throw new Error("Version must be 7 or higher for encoding");
  }

  let d = version << 12;

  while (getBCHDigit(d) - G18_BCH >= 0) {
    d ^= G18 << (getBCHDigit(d) - G18_BCH);
  }

  return (version << 12) | d;
}
