export class BinaryToPng {
  static readonly IS_NODE =
    typeof process !== "undefined" &&
    process?.versions &&
    process?.versions.node;

  static base64ToBinary(base64: string) {
    let bytes;

    if (BinaryToPng.IS_NODE) {
      bytes = Uint8Array.from(Buffer.from(base64, "base64"));
    } else {
      const bin = atob(base64);
      bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    }

    return Array.from(bytes, (b) => b.toString(2).padStart(8, "0")).join("");
  }

  static async binaryToPNG({
    binary,
    rows,
    scale = 10,
    reversed = false,
    foreground = [0, 0, 0],
    background = [255, 255, 255],
  }: {
    binary: string;
    rows: number;
    scale: number;
    reversed?: boolean;
    foreground?: [number, number, number];
    background?: [number, number, number];
  }) {
    if (binary.length < rows * rows) {
      throw new Error("Insufficient binary");
    }

    const width = rows * scale;
    const height = rows * scale;
    const stride = width * 4 + 1;
    const raw = new Uint8Array(stride * height);

    let offset = 0;

    for (let y = 0; y < height; y++) {
      raw[offset++] = 0x00; // PNG filter: None

      for (let x = 0; x < width; x++) {
        const qrY = Math.floor(y / scale);
        const qrX = Math.floor(x / scale);
        const bit = binary[qrY * rows + qrX] === "1";

        const on = reversed ? !bit : bit;
        const [r, g, b] = on ? foreground : background;

        raw[offset++] = r;
        raw[offset++] = g;
        raw[offset++] = b;
        raw[offset++] = 255;
      }
    }

    const compressed = await BinaryToPng.deflate(raw);

    /* ===== PNG structure ===== */
    const signature = Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);

    const ihdr = new Uint8Array(13);
    const view = new DataView(ihdr.buffer);
    view.setUint32(0, width);
    view.setUint32(4, height);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // RGBA
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    return BinaryToPng.concatUint8(
      signature,
      BinaryToPng.pngChunk("IHDR", ihdr),
      BinaryToPng.pngChunk("IDAT", compressed),
      BinaryToPng.pngChunk("IEND", new Uint8Array(0)),
    );
  }

  private static getZlib() {
    if (!BinaryToPng.IS_NODE) return null;
    return require("node:zlib");
  }

  private static concatUint8(...arrays: any[]) {
    const size = arrays.reduce((s, a) => s + a.length, 0);
    const out = new Uint8Array(size);
    let offset = 0;
    for (const a of arrays) {
      out.set(a, offset);
      offset += a.length;
    }
    return out;
  }

  private static crc32(buf: any) {
    let crc = ~0;
    for (const byte of buf) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
    }
    return ~crc >>> 0;
  }

  private static pngChunk(type: any, data: any) {
    const length = new Uint8Array(4);
    new DataView(length.buffer).setUint32(0, data.length);

    const name = Uint8Array.from(type, (c: any) => c.charCodeAt(0));
    const crc = new Uint8Array(4);
    new DataView(crc.buffer).setUint32(
      0,
      BinaryToPng.crc32(BinaryToPng.concatUint8(name, data)),
    );

    return BinaryToPng.concatUint8(length, name, data, crc);
  }

  private static async deflate(data: any) {
    if (BinaryToPng.IS_NODE) {
      const zlib = BinaryToPng.getZlib();
      return Uint8Array.from(zlib.deflateSync(data));
    }

    if (typeof CompressionStream === "undefined") {
      throw new TypeError(
        "CompressionStream is not supported in this browser.",
      );
    }

    const cs = new CompressionStream("deflate");
    const writer = cs.writable.getWriter();
    writer.write(data);
    writer.close();

    const reader = cs.readable.getReader();
    const chunks = [];

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    return BinaryToPng.concatUint8(...chunks);
  }
}
