import { CRCService } from '../../../domain/crypto/services/crc-service';

describe('CRCService', () => {
  describe('calculateCRC16', () => {
    it('should calculate CRC16 for empty string', () => {
      const crc = CRCService.calculateCRC16('');
      
      expect(crc).toBe('FFFF');
      expect(crc).toHaveLength(4);
    });

    it('should calculate CRC16 for simple string', () => {
      const crc = CRCService.calculateCRC16('test');
      
      expect(crc).toMatch(/^[0-9A-F]{4}$/);
      expect(crc).toHaveLength(4);
    });

    it('should calculate CRC16 for EMV QR data', () => {
      const qrData = '00020101021102123456789012345678901234567890123456789063';
      const crc = CRCService.calculateCRC16(qrData);
      
      expect(crc).toMatch(/^[0-9A-F]{4}$/);
      expect(crc).toHaveLength(4);
    });

    it('should return consistent results for same input', () => {
      const data = 'consistent-test-data';
      const crc1 = CRCService.calculateCRC16(data);
      const crc2 = CRCService.calculateCRC16(data);
      
      expect(crc1).toBe(crc2);
    });

    it('should return different results for different inputs', () => {
      const crc1 = CRCService.calculateCRC16('data1');
      const crc2 = CRCService.calculateCRC16('data2');
      
      expect(crc1).not.toBe(crc2);
    });

    it('should handle special characters', () => {
      const crc = CRCService.calculateCRC16('áéíóú@#$%');
      
      expect(crc).toMatch(/^[0-9A-F]{4}$/);
      expect(crc).toHaveLength(4);
    });

    it('should handle numbers', () => {
      const crc = CRCService.calculateCRC16('1234567890');
      
      expect(crc).toMatch(/^[0-9A-F]{4}$/);
      expect(crc).toHaveLength(4);
    });

    it('should handle long strings', () => {
      const longString = 'a'.repeat(1000);
      const crc = CRCService.calculateCRC16(longString);
      
      expect(crc).toMatch(/^[0-9A-F]{4}$/);
      expect(crc).toHaveLength(4);
    });

    it('should pad result with zeros if needed', () => {
      // Test with data that might produce short CRC
      const crc = CRCService.calculateCRC16('0');
      
      expect(crc).toHaveLength(4);
      expect(crc).toMatch(/^[0-9A-F]{4}$/);
    });
  });

  describe('validateCRC16', () => {
    it('should validate correct CRC', () => {
      const data = 'test-data';
      const crc = CRCService.calculateCRC16(data);
      const dataWithCRC = data + crc;
      
      expect(CRCService.validateCRC16(dataWithCRC)).toBe(true);
    });

    it('should reject incorrect CRC', () => {
      const dataWithWrongCRC = 'test-data1234';
      
      expect(CRCService.validateCRC16(dataWithWrongCRC)).toBe(false);
    });

    it('should handle empty string', () => {
      expect(CRCService.validateCRC16('')).toBe(false);
    });

    it('should handle short strings', () => {
      expect(CRCService.validateCRC16('123')).toBe(false);
      expect(CRCService.validateCRC16('12')).toBe(false);
      expect(CRCService.validateCRC16('1')).toBe(false);
    });

    it('should handle exactly 4 characters', () => {
      // This should be false since it's just a CRC without data
      expect(CRCService.validateCRC16('1234')).toBe(false);
    });

    it('should be case insensitive for provided CRC', () => {
      const data = 'test-data';
      const crc = CRCService.calculateCRC16(data);
      const dataWithLowerCRC = data + crc.toLowerCase();
      
      expect(CRCService.validateCRC16(dataWithLowerCRC)).toBe(true);
    });

    it('should validate EMV QR code format', () => {
      const qrData = '00020101021102123456789012345678901234567890123456789063';
      const crc = CRCService.calculateCRC16(qrData + '04');
      const completeQR = qrData + '04' + crc;
      
      expect(CRCService.validateCRC16(completeQR)).toBe(true);
    });

    it('should reject tampered data', () => {
      const data = 'original-data';
      const crc = CRCService.calculateCRC16(data);
      const tamperedData = 'tampered-data' + crc;
      
      expect(CRCService.validateCRC16(tamperedData)).toBe(false);
    });

    it('should handle mixed case in data', () => {
      const data = 'MiXeD-CaSe-DaTa';
      const crc = CRCService.calculateCRC16(data);
      const dataWithCRC = data + crc;
      
      expect(CRCService.validateCRC16(dataWithCRC)).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('should work with real EMV QR data structure', () => {
      const payloadFormat = '000201';
      const pointOfInitiation = '010211';
      const merchantAccount = '02101234567890';
      const merchantCategory = '52044111';
      const transactionCurrency = '53033170';
      const countryCode = '5802CO';
      const merchantName = '5909MiTienda';
      const merchantCity = '6006Bogota';
      
      const qrBody = payloadFormat + pointOfInitiation + merchantAccount + 
                     merchantCategory + transactionCurrency + countryCode + 
                     merchantName + merchantCity + '6304';
      
      const crc = CRCService.calculateCRC16(qrBody);
      const completeQR = qrBody + crc;
      
      expect(CRCService.validateCRC16(completeQR)).toBe(true);
    });

    it('should detect single character changes', () => {
      const data = 'sensitive-data';
      const crc = CRCService.calculateCRC16(data);
      const originalData = data + crc;
      
      // Change one character
      const modifiedData = 'Sensitive-data' + crc;
      
      expect(CRCService.validateCRC16(originalData)).toBe(true);
      expect(CRCService.validateCRC16(modifiedData)).toBe(false);
    });
  });
});