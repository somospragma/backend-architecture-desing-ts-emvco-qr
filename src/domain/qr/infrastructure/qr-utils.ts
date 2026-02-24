let toSJISFunction: ((kanji: string) => number) | undefined;

const CODEWORDS_COUNT = [
  0, // Not used
  26, 44, 70, 100, 134, 172, 196, 242, 292, 346, 404, 466, 532, 581, 655, 733,
  815, 901, 991, 1085, 1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051,
  2185, 2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706,
];

export function getSymbolSize(version: number): number {
  if (!version) throw new Error('Version parameter is required');
  if (version < 1 || version > 40)
    throw new Error('Version must be between 1 and 40');
  return version * 4 + 17;
}

export function getSymbolTotalCodewords(version: number): number {
  return CODEWORDS_COUNT[version];
}

export function getBCHDigit(data: number): number {
  let digit = 0;

  while (data !== 0) {
    digit++;
    data >>>= 1;
  }

  return digit;
}

export function setToSJISFunction(f: (kanji: string) => number): void {
  if (typeof f !== "function") {
    throw new TypeError('toSJISFunc must be a valid function');
  }

  toSJISFunction = f;
}

export function isKanjiModeEnabled(): boolean {
  return  toSJISFunction !== undefined;
}

export function toSJIS(kanji: string): number {
  if (!toSJISFunction) {
    throw new Error("Kanji conversion function has not been configured");
  }
  return toSJISFunction(kanji);
}

export function isValid(version: any): version is number {
  return (
    typeof version === "number" &&
    !Number.isNaN(version) &&
    version >= 1 &&
    version <= 40
  );
}
