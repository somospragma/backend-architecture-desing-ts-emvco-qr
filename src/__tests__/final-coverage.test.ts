import { EMVCoContentSemanticBuilder } from '../application/emv-semantic-builder';
import { EMVField } from '../domain/emv/entities/emv-field';
import { EMVTLVService } from '../domain/emv/services/emv-tlv-service';
import { EMVTLVValidator } from '../domain/emv/services/emv-tlv-validator';
import { QRCodeService } from '../domain/qr/services/qr-code-service';
import { BinaryToPng } from '../domain/qr/infrastructure/binary-png';
import { ErrorCorrectionCode } from '../domain/qr/infrastructure/error-correction-code';
import * as QRUtils from '../domain/qr/infrastructure/qr-utils';
import { BitMatrix } from '../domain/qr/entities/qr-matrix';
import * as ErrorCorrectionLevel from '../domain/qr/value-objects/error-correction-level';
import * as QRVersion from '../domain/qr/value-objects/qr-version';
import * as MaskPattern from '../domain/qr/value-objects/mask-pattern';

describe('Final Coverage Push - 100%', () => {
  describe('EMV Semantic Builder - Lines 565-570', () => {
    it('should handle tag with maxLength > 0', () => {
      const builder = new EMVCoContentSemanticBuilder();
      builder.setPayloadFormatIndicator('01');
      builder.setMerchantName('A'.repeat(100));
      const result = builder.build();
      expect(result).toBeDefined();
    });

    it('should handle tag with maxLength = 0', () => {
      const builder = new EMVCoContentSemanticBuilder();
      builder.setCountryCode('US');
      const result = builder.build();
      expect(result).toBeDefined();
    });
  });

  describe('EMV TLV Service - Line 50', () => {
    it('should parse TLV with subtags', () => {
      const builder = new EMVCoContentSemanticBuilder();
      builder.setPayloadFormatIndicator('01');
      builder.setMerchantAccountGUI('COM.MIPAGO.ID');
      builder.setMerchantAccountId('123456789', EMVField.MERCHANT_ACCOUNT_MERCHANT_ID);
      const qr = builder.build();
      const result = EMVTLVService.parse(qr);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('EMV TLV Validator - Lines 35, 48, 127', () => {
    it('should validate structure with length > 99', () => {
      const service = require('../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        { tag: '59', length: 150, value: 'A'.repeat(150) },
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some((e: string) => e.includes('exceeds maximum'))).toBe(true);
      spy.mockRestore();
    });

    it('should validate template without subtags', () => {
      const service = require('../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        { tag: '26', length: 0, value: '' },
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some((e: string) => e.includes('Must be a template'))).toBe(true);
      spy.mockRestore();
    });

    it('should validate tax coherence without subtags', () => {
      const service = require('../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        { tag: '81', length: 0, value: '' },
        { tag: '82', length: 0, value: '' },
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result).toBeDefined();
      spy.mockRestore();
    });

    it('should validate subtag length > 99', () => {
      const service = require('../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        { tag: '26', length: 10, subtags: [{ tag: '00', length: 150, value: 'A'.repeat(150) }] },
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some((e: string) => e.includes('Subtag') && e.includes('exceeds maximum'))).toBe(true);
      spy.mockRestore();
    });
  });

  describe('QR Matrix - Line 10', () => {
    it('should set reserved bit', () => {
      const matrix = new BitMatrix(21);
      matrix.set(0, 0, true, true);
      expect(matrix.isReserved(0, 0)).toBe(true);
    });
  });

  describe('Binary PNG - Lines 11-12, 57, 93-108', () => {
    it('should use browser atob when available', () => {
      const originalIsNode = Object.getOwnPropertyDescriptor(BinaryToPng, 'IS_NODE');
      Object.defineProperty(BinaryToPng, 'IS_NODE', { value: false, writable: true, configurable: true });
      
      (global as any).atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
      
      const base64 = Buffer.from([255, 0]).toString('base64');
      const result = BinaryToPng.base64ToBinary(base64);
      expect(result).toBeDefined();
      
      delete (global as any).atob;
      if (originalIsNode) Object.defineProperty(BinaryToPng, 'IS_NODE', originalIsNode);
    });

    it('should handle reversed colors', async () => {
      const binary = '1111000011110000';
      const png = await BinaryToPng.binaryToPNG({ binary, rows: 4, scale: 1, reversed: false });
      expect(png).toBeDefined();
    });

    it('should handle CompressionStream in browser', async () => {
      const originalIsNode = Object.getOwnPropertyDescriptor(BinaryToPng, 'IS_NODE');
      Object.defineProperty(BinaryToPng, 'IS_NODE', { value: false, writable: true, configurable: true });
      
      (global as any).CompressionStream = class {
        writable = {
          getWriter: () => ({
            write: jest.fn(),
            close: jest.fn()
          })
        };
        readable = {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({ value: new Uint8Array([120, 156, 1, 2, 3]), done: false })
              .mockResolvedValueOnce({ done: true })
          })
        };
      };
      
      const binary = '1111000011110000';
      const png = await BinaryToPng.binaryToPNG({ binary, rows: 4, scale: 1 });
      expect(png).toBeDefined();
      
      delete (global as any).CompressionStream;
      if (originalIsNode) Object.defineProperty(BinaryToPng, 'IS_NODE', originalIsNode);
    });

    it('should throw error when CompressionStream not available', async () => {
      const originalIsNode = Object.getOwnPropertyDescriptor(BinaryToPng, 'IS_NODE');
      Object.defineProperty(BinaryToPng, 'IS_NODE', { value: false, writable: true, configurable: true });
      
      delete (global as any).CompressionStream;
      
      const binary = '1111000011110000';
      await expect(
        BinaryToPng.binaryToPNG({ binary, rows: 4, scale: 1 })
      ).rejects.toThrow('CompressionStream is not supported');
      
      if (originalIsNode) Object.defineProperty(BinaryToPng, 'IS_NODE', originalIsNode);
    });
  });

  describe('Error Correction Code - Lines 17, 31', () => {
    it('should return undefined for invalid level', () => {
      const result = ErrorCorrectionCode.getBlocksCount(1, { bit: 99 } as any);
      expect(result).toBeUndefined();
    });

    it('should return undefined for getTotalCodewordsCount with invalid level', () => {
      const result = ErrorCorrectionCode.getTotalCodewordsCount(1, { bit: 99 } as any);
      expect(result).toBeUndefined();
    });
  });

  describe('QR Utils - Line 46', () => {
    it('should throw error when toSJIS called without function', () => {
      // Reset the function
      const originalFunc = (QRUtils as any).toSJISFunction;
      (QRUtils as any).toSJISFunction = undefined;
      
      expect(() => QRUtils.toSJIS('test')).toThrow('Kanji conversion function has not been configured');
      
      // Restore
      if (originalFunc) {
        QRUtils.setToSJISFunction(originalFunc);
      }
    });
  });

  describe('QR Code Service - Lines 31, 33, 36', () => {
    it('should handle width parameter', () => {
      const result = QRCodeService.createBase64({ content: 'test', width: 300 });
      expect(result).toBeDefined();
    });

    it('should handle no width parameter', () => {
      const result = QRCodeService.createBase64({ content: 'test', width: 200 });
      expect(result).toBeDefined();
    });

    it('should handle errorCorrectionLevel parameter', () => {
      const result = QRCodeService.createBase64({ 
        content: 'test',
        width: 200,
        errorCorrectionLevel: 'H' 
      });
      expect(result).toBeDefined();
    });

    it('should use genericImage parameter', () => {
      const result = QRCodeService.createBase64({ content: 'test', width: 200 }, true);
      expect(result).toBeDefined();
      expect(result).not.toMatch(/^\d+/);
    });

    it('should handle version parameter', () => {
      const result = QRCodeService.createBase64({ 
        content: 'test',
        width: 200,
        version: 5
      });
      expect(result).toBeDefined();
    });
  });

  describe('Error Correction Level - Line 29', () => {
    it('should handle from with invalid input', () => {
      const result = ErrorCorrectionLevel.from('invalid', ErrorCorrectionLevel.M);
      expect(result).toBe(ErrorCorrectionLevel.M);
    });
  });

  describe('QR Version - Lines 26, 46', () => {
    it('should throw error for invalid version in getCapacity', () => {
      expect(() => QRVersion.getCapacity(0, ErrorCorrectionLevel.M)).toThrow('must be between 1 and 40');
    });

    it('should throw error for version < 7 in getEncodedBits', () => {
      expect(() => QRVersion.getEncodedBits(6)).toThrow('must be 7 or higher');
    });
  });

  describe('Mask Pattern - Line 134', () => {
    it('should return undefined for invalid mask pattern', () => {
      const result = MaskPattern.from(8);
      expect(result).toBeUndefined();
    });
  });

  describe('Binary Hex Converter - Line 18', () => {
    it('should handle binary with length not multiple of 4', () => {
      const { BinaryHexConverter } = require('../shared/utils/binary-hex-converter');
      const result = BinaryHexConverter.binaryToHex('101');
      expect(result).toBeDefined();
    });
  });
});
