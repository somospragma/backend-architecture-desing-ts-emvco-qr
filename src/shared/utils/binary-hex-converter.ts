export class BinaryHexConverter {
  static hexToBinary(hex: string): string {
    this.validateHex(hex);

    return hex
      .split("")
      .map((char) => {
        const binary = Number.parseInt(char, 16).toString(2);
        return this.leftPad(binary, 4, "0");
      })
      .join("");
  }

  static binaryToHex(binary: string): string {
    this.validateBinary(binary);

    const paddedBinary = this.padBinaryToNibble(binary);
    const chunks = paddedBinary.match(/.{1,4}/g) || [];

    return chunks
      .map((chunk) => Number.parseInt(chunk, 2).toString(16))
      .join("");
  }

  private static padBinaryToNibble(binary: string): string {
    let result = binary;

    while (result.length % 4 !== 0) {
      result = "0" + result;
    }

    return result;
  }

  private static leftPad(value: string, length: number, padChar: string): string {
    let result = value;

    while (result.length < length) {
      result = padChar + result;
    }

    return result;
  }

  private static validateHex(hex: string): void {
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
      throw new Error("Invalid hexadecimal string");
    }
  }

  private static validateBinary(binary: string): void {
    if (!/^[01]+$/.test(binary)) {
      throw new Error("Invalid binary string");
    }
  }
}