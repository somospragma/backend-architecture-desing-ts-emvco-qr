export class CRCService {
  private static readonly POLYNOMIAL_16_CCITT = 0x1021;

  static calculateCRC16(data: string): string {
    const utf8Encoder = new TextEncoder();
    const bytes = utf8Encoder.encode(data);

    let crc: number = 0xffff;
    const polynomial = this.POLYNOMIAL_16_CCITT;

    for (const byte of bytes) {
      crc ^= (byte << 8) & 0xffff;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) === 0) {
          crc = (crc << 1) & 0xffff;
        } else {
          crc = ((crc << 1) & 0xffff) ^ polynomial;
        }
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  static validateCRC16(qrData: string): boolean {
    if (qrData.length < 4) return false;
    
    const dataWithoutCrc = qrData.substring(0, qrData.length - 4);
    const providedCrc = qrData.substring(qrData.length - 4);
    const calculatedCrc = this.calculateCRC16(dataWithoutCrc);
    
    return providedCrc.toUpperCase() === calculatedCrc;
  }
}