// Application Layer
export { EMVCoContentBuilder } from "./application/emv-builder";
export { EMVCoContentSemanticBuilder } from "./application/emv-semantic-builder";

// Domain Layer - EMV
export {
  EMVTag,
  TagType,
  EMVTagValue,
} from "./domain/emv/value-objects/emv-tag";
export { EMVTagRegistry } from "./domain/emv/services/emv-tag-registry";
export { EMVField, keyType, TypeConditionValue } from "./domain/emv/entities/emv-field";

// Domain Layer - QR
export { QRCodeService, QRConfig } from "./domain/qr/services/qr-code-service";

// Domain Layer - Crypto
export { CRCService } from "./domain/crypto/services/crc-service";
export { HashCodeBuilder } from "./domain/crypto/services/hash-service";

// Types
export type AlgorithmIdentifier = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

// Shared Layer
export { BinaryHexConverter } from "./shared/utils/binary-hex-converter";
export { BinaryToPng } from "./domain/qr/infrastructure/binary-png";
// Legacy exports for backward compatibility
export { EMVCoContentBuilder as EMVCoQRContentBuilder } from "./application/emv-builder";
export { EMVCoContentSemanticBuilder as EMVCoQrContentSemanticBuilder } from "./application/emv-semantic-builder";
export { EMVTLVService } from "./domain/emv/services/emv-tlv-service";

export { QRCodeService as QrCodeImage } from "./domain/qr/services/qr-code-service";
export { CRCService as Crc } from "./domain/crypto/services/crc-service";
export { CRCService as CRCUtils } from "./domain/crypto/services/crc-service";
