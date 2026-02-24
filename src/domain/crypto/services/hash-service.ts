export class HashCodeBuilder {
  private uniqueCode!: string;
  private channel!: string;
  private terminalId!: string;
  private transactionId!: string;
  private transactionAmount!: string | number;
  private timestamp: number = Date.now();
  private algorithmIdentifier: AlgorithmIdentifier = "SHA-256";

  private getCrypto(): SubtleCrypto {
    if (globalThis.window?.crypto?.subtle) {
      return globalThis.window.crypto.subtle;
    }
    if (globalThis.crypto?.subtle) {
      return globalThis.crypto.subtle;
    }
    throw new Error("Web Crypto API is not available in this environment");
  }

  async build(): Promise<string> {
    if (
      !this.uniqueCode ||
      !this.channel ||
      !this.terminalId ||
      !this.transactionId ||
      !this.transactionAmount
    ) {
      throw new Error("All fields are required.");
    }

    const concatenated = `${this.uniqueCode}${this.channel}${this.terminalId}${this.transactionId}${this.transactionAmount}${this.timestamp}`;

    const hashBytes: Uint8Array = await this.sha(concatenated);

    const base64Hash = this.base64Encode(hashBytes);
    const securityCode = base64Hash.substring(0, 24);

    return securityCode;
  }

  setAlgorithmIdentifier(id: AlgorithmIdentifier) {
    this.algorithmIdentifier = id;
  }

  setUniqueCode(value: string): this {
    this.uniqueCode = value || "0";
    return this;
  }

  setChannel(value: string): this {
    if (!value) {
      throw new Error("Channel is required.");
    }
    this.channel = value;
    return this;
  }

  setTerminalId(value: string): this {
    this.terminalId = value || "0";
    return this;
  }

  setTransactionId(value: string): this {
    this.transactionId = value || "0";
    return this;
  }

  setTransactionAmount(value: string | number): this {
    this.transactionAmount = Number(value || 0) > 0 ? value : "0";
    return this;
  }

  setTimestamp(timestamp?: number): this {
    this.timestamp = timestamp ?? Date.now();

    return this;
  }

  private async sha(input: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const crypto = this.getCrypto();

    return new Uint8Array(await crypto.digest(this.algorithmIdentifier, data));
  }

  private base64Encode(bytes: Uint8Array): string {
    if (typeof btoa !== "undefined") {
      let binary = "";
      for (const byte of bytes) {
        binary += String.fromCodePoint(byte);
      }
      return btoa(binary);
    }
    return Buffer.from(bytes).toString("base64");
  }
}
