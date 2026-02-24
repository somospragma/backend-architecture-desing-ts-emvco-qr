import { BitMatrix } from "../entities/qr-matrix";
import QrCodeGenerator from "./qr-code-generator";

export type QRConfig = {
  width: number;
  content: string;
  version?: number;
  errorCorrectionLevel?: string;
};

export class QRCodeService {
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
}
