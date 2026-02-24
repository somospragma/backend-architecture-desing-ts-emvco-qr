import { QRCodeService } from '../../../domain/qr/services/qr-code-service';

describe('QRCodeService', () => {
  describe('createBase64', () => {
    it('should create base64 QR code with default config', () => {
      const config = { width: 200, content: 'test content' };
      const result = QRCodeService.createBase64(config);

      expect(result).toMatch(/^\d+[A-Za-z0-9+/=]+$/);
    });

    it('should create generic base64 without size prefix', () => {
      const config = { width: 200, content: 'test content' };
      const result = QRCodeService.createBase64(config, true);

      expect(result).toMatch(/^[A-Za-z0-9+/=]+$/);
      expect(result).not.toMatch(/^\d/);
    });

    it('should use provided error correction level', () => {
      const config = { width: 200, content: 'test', errorCorrectionLevel: 'H' };
      const result = QRCodeService.createBase64(config);

      expect(result).toMatch(/^\d+[A-Za-z0-9+/=]+$/);
    });

    it('should handle different QR sizes', () => {
      const config = { width: 200, content: 'a'.repeat(500) };
      const result = QRCodeService.createBase64(config);

      expect(result).toMatch(/^\d+[A-Za-z0-9+/=]+$/);
    });

    it('should handle error correction level L', () => {
      const config = { width: 200, content: 'test', errorCorrectionLevel: 'L' };
      const result = QRCodeService.createBase64(config);
      expect(result).toBeDefined();
    });

    it('should handle error correction level M', () => {
      const config = { width: 200, content: 'test', errorCorrectionLevel: 'M' };
      const result = QRCodeService.createBase64(config);
      expect(result).toBeDefined();
    });

    it('should handle error correction level Q', () => {
      const config = { width: 200, content: 'test', errorCorrectionLevel: 'Q' };
      const result = QRCodeService.createBase64(config);
      expect(result).toBeDefined();
    });
  });
});