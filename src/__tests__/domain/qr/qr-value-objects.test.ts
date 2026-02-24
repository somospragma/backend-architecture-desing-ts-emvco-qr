import * as EncodingMode from '../../../domain/qr/value-objects/encoding-mode';
import * as QRVersion from '../../../domain/qr/value-objects/qr-version';
import { M as ECLevelM } from '../../../domain/qr/value-objects/error-correction-level';

describe('QR Value Objects', () => {
  describe('EncodingMode', () => {
    describe('Mode constants', () => {
      it('should have NUMERIC mode', () => {
        expect(EncodingMode.NUMERIC.id).toBe('Numeric');
        expect(EncodingMode.NUMERIC.bit).toBe(1);
        expect(EncodingMode.NUMERIC.ccBits).toEqual([10, 12, 14]);
      });

      it('should have ALPHANUMERIC mode', () => {
        expect(EncodingMode.ALPHANUMERIC.id).toBe('Alphanumeric');
        expect(EncodingMode.ALPHANUMERIC.bit).toBe(2);
      });

      it('should have BYTE mode', () => {
        expect(EncodingMode.BYTE.id).toBe('Byte');
        expect(EncodingMode.BYTE.bit).toBe(4);
      });

      it('should have KANJI mode', () => {
        expect(EncodingMode.KANJI.id).toBe('Kanji');
        expect(EncodingMode.KANJI.bit).toBe(8);
      });

      it('should have MIXED mode', () => {
        expect(EncodingMode.MIXED.bit).toBe(-1);
      });
    });

    describe('getCharCountIndicator', () => {
      it('should return correct indicator for version 1-9', () => {
        const result = EncodingMode.getCharCountIndicator(EncodingMode.NUMERIC, 5);
        expect(result).toBe(10);
      });

      it('should return correct indicator for version 10-26', () => {
        const result = EncodingMode.getCharCountIndicator(EncodingMode.NUMERIC, 15);
        expect(result).toBe(12);
      });

      it('should return correct indicator for version 27-40', () => {
        const result = EncodingMode.getCharCountIndicator(EncodingMode.NUMERIC, 30);
        expect(result).toBe(14);
      });

      it('should throw error for invalid version', () => {
        expect(() => EncodingMode.getCharCountIndicator(EncodingMode.NUMERIC, 0)).toThrow('out of range');
        expect(() => EncodingMode.getCharCountIndicator(EncodingMode.NUMERIC, 41)).toThrow('out of range');
      });

      it('should throw error for mode without ccBits', () => {
        expect(() => EncodingMode.getCharCountIndicator({ bit: 1 }, 5)).toThrow('Mode configuration is invalid');
      });
    });

    describe('getBestModeForData', () => {
      it('should return NUMERIC for numeric data', () => {
        const mode = EncodingMode.getBestModeForData('12345');
        expect(mode).toBe(EncodingMode.NUMERIC);
      });

      it('should return ALPHANUMERIC for alphanumeric data', () => {
        const mode = EncodingMode.getBestModeForData('ABC123');
        expect(mode).toBe(EncodingMode.ALPHANUMERIC);
      });

      it('should return BYTE for mixed data', () => {
        const mode = EncodingMode.getBestModeForData('abc@123');
        expect(mode).toBe(EncodingMode.BYTE);
      });
    });

    describe('toString', () => {
      it('should return mode id', () => {
        expect(EncodingMode.toString(EncodingMode.NUMERIC)).toBe('Numeric');
        expect(EncodingMode.toString(EncodingMode.ALPHANUMERIC)).toBe('Alphanumeric');
        expect(EncodingMode.toString(EncodingMode.BYTE)).toBe('Byte');
        expect(EncodingMode.toString(EncodingMode.KANJI)).toBe('Kanji');
      });

      it('should throw error for invalid mode', () => {
        expect(() => EncodingMode.toString({ bit: 1 })).toThrow('not properly configured');
      });
    });

    describe('isValid', () => {
      it('should return true for valid mode', () => {
        expect(EncodingMode.isValid(EncodingMode.NUMERIC)).toBe(true);
        expect(EncodingMode.isValid(EncodingMode.ALPHANUMERIC)).toBe(true);
        expect(EncodingMode.isValid(EncodingMode.BYTE)).toBe(true);
        expect(EncodingMode.isValid(EncodingMode.KANJI)).toBe(true);
        expect(EncodingMode.isValid(EncodingMode.MIXED)).toBe(true);
      });

      it('should return false for invalid mode', () => {
        expect(EncodingMode.isValid({ bit: 1 })).toBe(false);
        expect(EncodingMode.isValid(null)).toBe(false);
        expect(EncodingMode.isValid(undefined)).toBe(false);
        expect(EncodingMode.isValid({})).toBe(false);
      });
    });

    describe('from', () => {
      it('should parse string to mode', () => {
        expect(EncodingMode.from('numeric', EncodingMode.BYTE)).toBe(EncodingMode.NUMERIC);
        expect(EncodingMode.from('alphanumeric', EncodingMode.BYTE)).toBe(EncodingMode.ALPHANUMERIC);
        expect(EncodingMode.from('kanji', EncodingMode.BYTE)).toBe(EncodingMode.KANJI);
      });

      it('should be case insensitive', () => {
        expect(EncodingMode.from('NUMERIC', EncodingMode.BYTE)).toBe(EncodingMode.NUMERIC);
      });

      it('should return default for invalid string', () => {
        const result = EncodingMode.from('invalid', EncodingMode.BYTE);
        expect(result).toBe(EncodingMode.BYTE);
      });

      it('should return default for non-string', () => {
        const result = EncodingMode.from(123, EncodingMode.BYTE);
        expect(result).toBe(EncodingMode.BYTE);
      });
    });
  });

  describe('QRVersion', () => {
    describe('from', () => {
      it('should parse valid version', () => {
        expect(QRVersion.from(5)).toBe(5);
        expect(QRVersion.from(1)).toBe(1);
        expect(QRVersion.from(40)).toBe(40);
      });

      it('should parse string version', () => {
        const result = QRVersion.from('5');
        expect(typeof result).toBe('number');
      });

      it('should return default for invalid version', () => {
        expect(QRVersion.from(0, 1)).toBe(1);
        expect(QRVersion.from(41, 1)).toBe(1);
        expect(QRVersion.from(-1, 1)).toBe(1);
      });

      it('should return undefined if no default', () => {
        expect(QRVersion.from(0)).toBeUndefined();
      });
    });

    describe('getCapacity', () => {
      it('should return capacity for NUMERIC mode', () => {
        const capacity = QRVersion.getCapacity(1, ECLevelM, EncodingMode.NUMERIC);
        expect(capacity).toBeGreaterThan(0);
        expect(typeof capacity).toBe('number');
      });

      it('should return capacity for ALPHANUMERIC mode', () => {
        const capacity = QRVersion.getCapacity(1, ECLevelM, EncodingMode.ALPHANUMERIC);
        expect(capacity).toBeGreaterThan(0);
      });

      it('should return capacity for BYTE mode', () => {
        const capacity = QRVersion.getCapacity(1, ECLevelM, EncodingMode.BYTE);
        expect(capacity).toBeGreaterThan(0);
      });

      it('should return capacity for KANJI mode', () => {
        const capacity = QRVersion.getCapacity(1, ECLevelM, EncodingMode.KANJI);
        expect(capacity).toBeGreaterThan(0);
      });

      it('should return capacity for MIXED mode', () => {
        const capacity = QRVersion.getCapacity(1, ECLevelM, EncodingMode.MIXED);
        expect(capacity).toBeGreaterThan(0);
      });

      it('should use BYTE mode by default', () => {
        const capacity = QRVersion.getCapacity(1, ECLevelM);
        const byteCapacity = QRVersion.getCapacity(1, ECLevelM, EncodingMode.BYTE);
        expect(capacity).toBe(byteCapacity);
      });

      it('should throw error for invalid version', () => {
        expect(() => QRVersion.getCapacity(0, ECLevelM)).toThrow('must be between 1 and 40');
        expect(() => QRVersion.getCapacity(41, ECLevelM)).toThrow('must be between 1 and 40');
      });

      it('should return different capacities for different versions', () => {
        const cap1 = QRVersion.getCapacity(1, ECLevelM);
        const cap10 = QRVersion.getCapacity(10, ECLevelM);
        expect(cap10).toBeGreaterThan(cap1);
      });
    });

    describe('getBestVersionForData', () => {
      const mockSegment = {
        mode: EncodingMode.NUMERIC,
        getLength: () => 10,
        getBitsLength: () => 40
      };

      it('should return version for single segment', () => {
        const version = QRVersion.getBestVersionForData(mockSegment, ECLevelM);
        expect(version).toBeGreaterThan(0);
        expect(version).toBeLessThanOrEqual(40);
      });

      it('should return version for array with one segment', () => {
        const version = QRVersion.getBestVersionForData([mockSegment], ECLevelM);
        expect(version).toBeGreaterThan(0);
      });

      it('should return 1 for empty array', () => {
        const version = QRVersion.getBestVersionForData([], ECLevelM);
        expect(version).toBe(1);
      });

      it('should handle multiple segments', () => {
        const version = QRVersion.getBestVersionForData([mockSegment, mockSegment], ECLevelM);
        expect(version).toBeGreaterThan(0);
      });

      it('should return higher version for larger data', () => {
        const largeSegment = {
          mode: EncodingMode.BYTE,
          getLength: () => 1000,
          getBitsLength: () => 8000
        };
        const version = QRVersion.getBestVersionForData(largeSegment, ECLevelM);
        expect(version).toBeGreaterThan(5);
      });
    });

    describe('getEncodedBits', () => {
      it('should return encoded bits for version 7+', () => {
        const bits = QRVersion.getEncodedBits(7);
        expect(typeof bits).toBe('number');
        expect(bits).toBeGreaterThan(0);
      });

      it('should return different bits for different versions', () => {
        const bits7 = QRVersion.getEncodedBits(7);
        const bits10 = QRVersion.getEncodedBits(10);
        expect(bits7).not.toBe(bits10);
      });

      it('should throw error for version < 7', () => {
        expect(() => QRVersion.getEncodedBits(6)).toThrow('must be 7 or higher');
        expect(() => QRVersion.getEncodedBits(1)).toThrow('must be 7 or higher');
      });

      it('should throw error for invalid version', () => {
        expect(() => QRVersion.getEncodedBits(0)).toThrow('must be 7 or higher');
        expect(() => QRVersion.getEncodedBits(-1)).toThrow('must be 7 or higher');
      });

      it('should work for all valid versions', () => {
        for (let v = 7; v <= 40; v++) {
          const bits = QRVersion.getEncodedBits(v);
          expect(bits).toBeGreaterThan(0);
        }
      });
    });
  });
});
