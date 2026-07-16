type CompressionFormat = "deflate" | "deflate-raw" | "gzip";

declare class CompressionStream {
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<Uint8Array>;

  constructor(format: CompressionFormat);
}
