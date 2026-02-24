import { getSymbolSize } from "./qr-utils";

export class FinderPattern {
  private static readonly FINDER_PATTERN_SIZE = 7;

  static getPositions(version: number): number[][] {
    const size = getSymbolSize(version);

    return [
      [0, 0],
      [size - this.FINDER_PATTERN_SIZE, 0],
      [0, size - this.FINDER_PATTERN_SIZE],
    ];
  }
}
