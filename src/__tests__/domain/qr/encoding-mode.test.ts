import * as EncodingMode from '../../../domain/qr/value-objects/encoding-mode';
import { Mode } from '../../../domain/qr/value-objects/encoding-mode';

describe('EncodingMode', () => {
    describe('Constants', () => {
        it('should have correct NUMERIC constant', () => {
            expect(EncodingMode.NUMERIC).toBeDefined();
            expect(EncodingMode.NUMERIC.id).toBe('Numeric');
            expect(EncodingMode.NUMERIC.bit).toBe(1);
        });

        it('should have correct ALPHANUMERIC constant', () => {
            expect(EncodingMode.ALPHANUMERIC).toBeDefined();
            expect(EncodingMode.ALPHANUMERIC.id).toBe('Alphanumeric');
            expect(EncodingMode.ALPHANUMERIC.bit).toBe(2);
        });

        it('should have correct BYTE constant', () => {
            expect(EncodingMode.BYTE).toBeDefined();
            expect(EncodingMode.BYTE.id).toBe('Byte');
            expect(EncodingMode.BYTE.bit).toBe(4);
        });

        it('should have correct KANJI constant', () => {
            expect(EncodingMode.KANJI).toBeDefined();
            expect(EncodingMode.KANJI.id).toBe('Kanji');
            expect(EncodingMode.KANJI.bit).toBe(8);
        });

        it('should have correct MIXED constant', () => {
            expect(EncodingMode.MIXED).toBeDefined();
            expect(EncodingMode.MIXED.bit).toBe(-1);
        });
    });

    describe('getCharCountIndicator', () => {
        it('should return correct bits for Numeric mode', () => {
            expect(EncodingMode.getCharCountIndicator(EncodingMode.NUMERIC, 5)).toBe(10);
            expect(EncodingMode.getCharCountIndicator(EncodingMode.NUMERIC, 15)).toBe(12);
            expect(EncodingMode.getCharCountIndicator(EncodingMode.NUMERIC, 30)).toBe(14);
        });

        it('should return correct bits for Alphanumeric mode', () => {
            expect(EncodingMode.getCharCountIndicator(EncodingMode.ALPHANUMERIC, 5)).toBe(9);
            expect(EncodingMode.getCharCountIndicator(EncodingMode.ALPHANUMERIC, 15)).toBe(11);
            expect(EncodingMode.getCharCountIndicator(EncodingMode.ALPHANUMERIC, 30)).toBe(13);
        });

        it('should throw error for invalid mode configuration', () => {
            const invalidMode: Mode = { bit: 1, ccBits: undefined };
            expect(() => EncodingMode.getCharCountIndicator(invalidMode, 5)).toThrow('Mode configuration is invalid');
        });

        it('should throw error for invalid version', () => {
            expect(() => EncodingMode.getCharCountIndicator(EncodingMode.NUMERIC, 0)).toThrow('QR version number is out of range');
            expect(() => EncodingMode.getCharCountIndicator(EncodingMode.NUMERIC, 41)).toThrow('QR version number is out of range');
        });
    });

    describe('getBestModeForData', () => {
        it('should detect Numeric', () => {
            expect(EncodingMode.getBestModeForData('123456')).toBe(EncodingMode.NUMERIC);
            expect(EncodingMode.getBestModeForData('0')).toBe(EncodingMode.NUMERIC);
        });

        it('should detect Alphanumeric', () => {
            expect(EncodingMode.getBestModeForData('ABC123')).toBe(EncodingMode.ALPHANUMERIC);
            expect(EncodingMode.getBestModeForData('A')).toBe(EncodingMode.ALPHANUMERIC);
        });

        it('should fallback to Byte', () => {
            expect(EncodingMode.getBestModeForData('abc')).toBe(EncodingMode.BYTE);
            expect(EncodingMode.getBestModeForData('test@example.com')).toBe(EncodingMode.BYTE);
        });
    });

    describe('toString', () => {
        it('should return id for valid mode', () => {
            expect(EncodingMode.toString(EncodingMode.NUMERIC)).toBe('Numeric');
        });

        it('should throw error for invalid mode', () => {
            expect(() => EncodingMode.toString({ bit: 1 } as any)).toThrow('Mode object is not properly configured');
        });
    });

    describe('isValid', () => {
        it('should return true for valid modes', () => {
            expect(EncodingMode.isValid(EncodingMode.NUMERIC)).toBe(true);
            expect(EncodingMode.isValid(EncodingMode.MIXED)).toBe(true);
        });

        it('should return false for invalid modes', () => {
            expect(EncodingMode.isValid(null)).toBe(false);
            expect(EncodingMode.isValid({})).toBe(false);
            expect(EncodingMode.isValid({ bit: 1 })).toBe(false); // missing ccBits and not -1
        });
    });

    describe('from', () => {
        it('should return mode from string', () => {
            expect(EncodingMode.from('numeric', EncodingMode.BYTE)).toBe(EncodingMode.NUMERIC);
            expect(EncodingMode.from('Alphanumeric', EncodingMode.BYTE)).toBe(EncodingMode.ALPHANUMERIC);
            expect(EncodingMode.from('Kanji', EncodingMode.BYTE)).toBe(EncodingMode.KANJI);
            expect(EncodingMode.from('Byte', EncodingMode.BYTE)).toBe(EncodingMode.BYTE);
        });

        it('should return default value for unknown string', () => {
            expect(EncodingMode.from('unknown', EncodingMode.BYTE)).toBe(EncodingMode.BYTE);
        });

        it('should return input if it is already a valid mode', () => {
            expect(EncodingMode.from(EncodingMode.NUMERIC, EncodingMode.BYTE)).toBe(EncodingMode.NUMERIC);
        });

        it('should return default if input is invalid object', () => {
            expect(EncodingMode.from({}, EncodingMode.BYTE)).toBe(EncodingMode.BYTE);
        });

        it('should return default for non-string invalid input', () => {
            expect(EncodingMode.from(123 as any, EncodingMode.BYTE)).toBe(EncodingMode.BYTE);
        });
    });
});
