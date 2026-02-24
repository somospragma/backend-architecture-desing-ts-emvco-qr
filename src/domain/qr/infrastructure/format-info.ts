import { getBCHDigit } from "./qr-utils";
import { ErrorCorrectionLevel } from "../value-objects/error-correction-level";

export class FormatInfo {
  private static readonly G15 =
    (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
  private static readonly G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
  private static readonly G15_BCH = getBCHDigit(FormatInfo.G15);

  static getEncodedBits(
    errorCorrectionLevel: ErrorCorrectionLevel,
    mask: number
  ): number {
    const data = (errorCorrectionLevel.bit << 3) | mask;
    let d = data << 10;

    while (getBCHDigit(d) - this.G15_BCH >= 0) {
      d ^= this.G15 << (getBCHDigit(d) - this.G15_BCH);
    }

    return ((data << 10) | d) ^ this.G15_MASK;
  }
}
