import { EMVCoContentBuilder } from '../application/emv-builder';
import { CRCService } from '../domain/crypto/services/crc-service';
import { BinaryHexConverter } from '../shared/utils/binary-hex-converter';

describe('Integration Tests', () => {
  describe('Complete EMV QR Code Generation', () => {
    it('should generate valid EMV QR code with CRC validation', () => {
      const builder = new EMVCoContentBuilder();
      
      const qrCode = builder
        .setTag('52', '4111') // Merchant Category Code
        .setTag('53', '170')  // Transaction Currency (COP)
        .setTag('54', '100.50') // Transaction Amount
        .setTag('58', 'CO')   // Country Code
        .setTag('59', 'Mi Tienda Ejemplo') // Merchant Name
        .setTag('60', 'Bogota') // Merchant City
        .setSubTag('62', '01', 'REF123456') // Bill Number
        .setSubTag('62', '05', 'CUSTOMER001') // Customer Label
        .build();

      // Validate structure
      expect(qrCode).toContain('52044111');
      expect(qrCode).toContain('5303170');
      expect(qrCode).toContain('5406100.50');
      expect(qrCode).toContain('5802CO');
      expect(qrCode).toContain('5917Mi Tienda Ejemplo'); // Actual length
      expect(qrCode).toContain('6006Bogota');
      
      // Validate CRC
      expect(CRCService.validateCRC16(qrCode)).toBe(true);
      
      // Validate format
      expect(qrCode).toMatch(/^.*6304[0-9A-F]{4}$/);
    });

    it('should handle complex template structures', () => {
      const builder = new EMVCoContentBuilder();
      
      const qrCode = builder
        .setTag('52', '1234')
        .setSubTag('62', '01', 'BILL001')
        .setSubTag('62', '02', 'STORE001') 
        .setSubTag('62', '05', 'CUST001')
        .setSubTag('64', '00', 'ES')
        .setSubTag('64', '01', 'Tienda Ejemplo')
        .build();

      expect(qrCode).toContain('52041234');
      expect(qrCode).toContain('62340107BILL0010208STORE0010507CUST001'); // Actual format
      expect(qrCode).toContain('64240002ES0114Tienda Ejemplo');
      expect(CRCService.validateCRC16(qrCode)).toBe(true);
    });
  });

  describe('Cross-domain functionality', () => {
    it('should work with binary conversion utilities', () => {
      const hexValue = 'ABCD';
      const binary = BinaryHexConverter.hexToBinary(hexValue);
      const backToHex = BinaryHexConverter.binaryToHex(binary);
      
      expect(binary).toBe('1010101111001101');
      expect(backToHex.toUpperCase()).toBe(hexValue);
    });

    it('should integrate CRC with EMV builder', () => {
      const testData = '00020101021102123456789052044111530317058024CO5909MiTienda6006Bogota6304';
      const crc = CRCService.calculateCRC16(testData);
      const completeQR = testData + crc;
      
      expect(CRCService.validateCRC16(completeQR)).toBe(true);
      expect(crc).toMatch(/^[0-9A-F]{4}$/);
    });
  });

  describe('Error handling integration', () => {
    it('should handle invalid operations gracefully', () => {
      const builder = new EMVCoContentBuilder();
      
      expect(() => builder.setTag('62', 'invalid')).toThrow('is a template');
      expect(() => builder.setSubTag('52', '01', 'invalid')).toThrow('is not a template');
      expect(() => builder.setSubTag('62', '01', '')).toThrow('invalid');
    });

    it('should validate hex conversion errors', () => {
      expect(() => BinaryHexConverter.hexToBinary('XYZ')).toThrow('Invalid hexadecimal');
      expect(() => BinaryHexConverter.binaryToHex('123')).toThrow('Invalid binary');
    });

    it('should handle CRC validation edge cases', () => {
      expect(CRCService.validateCRC16('')).toBe(false);
      expect(CRCService.validateCRC16('123')).toBe(false);
      expect(CRCService.validateCRC16('invalid-crc-1234')).toBe(false);
    });
  });

  describe('Performance and memory', () => {
    it('should handle large QR codes efficiently', () => {
      const builder = new EMVCoContentBuilder();
      
      // Add many template fields
      for (let i = 1; i <= 20; i++) {
        builder.setSubTag('62', i.toString().padStart(2, '0'), `REF${i}`);
      }
      
      const result = builder.build();
      
      expect(result).toContain('6304');
      expect(CRCService.validateCRC16(result)).toBe(true);
    });

    it('should clear state properly after build', () => {
      const builder = new EMVCoContentBuilder();
      
      builder.setTag('52', '1111');
      const first = builder.build();
      
      builder.setTag('52', '2222');
      const second = builder.build();
      
      expect(first).toContain('52041111');
      expect(second).toContain('52042222');
      expect(second).not.toContain('1111');
    });
  });

  describe('Real-world scenarios', () => {
    it('should generate Colombian payment QR', () => {
      const builder = new EMVCoContentBuilder();
      
      const qr = builder
        .setTag('52', '4111') // General merchandise
        .setTag('53', '170')  // Colombian Peso
        .setTag('54', '25000') // $25,000 COP
        .setTag('58', 'CO')   // Colombia
        .setTag('59', 'Supermercado El Ahorro')
        .setTag('60', 'Medellin')
        .setSubTag('62', '01', 'FAC-2024-001')
        .setSubTag('80', '01', 'MOBILE') // Channel
        .setSubTag('90', '01', 'TXN123456') // Transaction ID
        .build();

      expect(qr).toContain('52044111');
      expect(qr).toContain('5303170');
      expect(qr).toContain('540525000');
      expect(qr).toContain('5802CO');
      expect(qr).toContain('5922Supermercado El Ahorro'); // Actual length
      expect(qr).toContain('6008Medellin');
      expect(qr).toContain('62160112FAC-2024-001'); // Actual format
      expect(qr).toContain('80100106MOBILE'); // Actual format
      expect(qr).toContain('90130109TXN123456'); // Actual format
      expect(CRCService.validateCRC16(qr)).toBe(true);
    });

    it('should handle international characters', () => {
      const builder = new EMVCoContentBuilder();
      
      const qr = builder
        .setTag('52', '5411')
        .setTag('58', 'CO')
        .setTag('59', 'Café & Más')
        .setTag('60', 'Bogotá')
        .build();

      expect(CRCService.validateCRC16(qr)).toBe(true);
      expect(qr).toContain('5910Café & Más');
      expect(qr).toContain('6006Bogotá'); // Actual length
    });
  });
});