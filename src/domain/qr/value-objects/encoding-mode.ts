import * as VersionCheck from "../infrastructure/qr-utils";
import * as Regex from "../infrastructure/regex";

export interface Mode {
  id?: string;
  bit: number;
  ccBits?: number[];
}

export const NUMERIC: Mode = {
  id: "Numeric",
  bit: 1,
  ccBits: [10, 12, 14],
};

export const ALPHANUMERIC: Mode = {
  id: "Alphanumeric",
  bit: 2,
  ccBits: [9, 11, 13],
};

export const BYTE: Mode = {
  id: "Byte",
  bit: 4,
  ccBits: [8, 16, 16],
};

export const KANJI: Mode = {
  id: "Kanji",
  bit: 8,
  ccBits: [8, 10, 12],
};

export const MIXED: Mode = {
  bit: -1,
};

export function getCharCountIndicator(mode: Mode, version: number): number {
  if (!mode.ccBits) throw new Error("Mode configuration is invalid");

  if (!VersionCheck.isValid(version)) {
    throw new Error("QR version number is out of range: " + version);
  }

  if (version >= 1 && version < 10) return mode.ccBits[0];
  else if (version < 27) return mode.ccBits[1];
  return mode.ccBits[2];
}

export function getBestModeForData(dataStr: string): Mode {
  if (Regex.testNumeric(dataStr)) return NUMERIC;
  else if (Regex.testAlphanumeric(dataStr)) return ALPHANUMERIC;
  else if (Regex.testKanji(dataStr)) return KANJI;
  else return BYTE;
}

export function toString(mode: Mode): string {
  if (mode && mode.id) return mode.id;
  throw new Error("Mode object is not properly configured");
}

export function isValid(mode: any): mode is Mode {
  return !!(
    mode &&
    typeof mode.bit !== "undefined" &&
    (mode.ccBits || mode.bit === -1)
  );
}

function fromString(string: string): Mode {
  if (typeof string !== "string") {
    throw new TypeError("Input parameter must be a string type");
  }

  const lcStr = string.toLowerCase();

  switch (lcStr) {
    case "numeric":
      return NUMERIC;
    case "alphanumeric":
      return ALPHANUMERIC;
    case "kanji":
      return KANJI;
    case "byte":
      return BYTE;
    default:
      throw new Error("Encoding mode not recognized: " + string);
  }
}

export function from(value: any, defaultValue: Mode): Mode {
  if (isValid(value)) {
    return value;
  }

  try {
    return fromString(value);
  } catch (e) {
    return defaultValue;
  }
}
