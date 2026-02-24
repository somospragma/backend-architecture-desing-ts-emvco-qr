import { BinaryHexConverter } from '../../shared/utils/binary-hex-converter';

describe('BinaryHexConverter', () => {
  describe('hexToBinary', () => {
    it('should convert single hex digit to binary', () => {
      expect(BinaryHexConverter.hexToBinary('0')).toBe('0000');
      expect(BinaryHexConverter.hexToBinary('1')).toBe('0001');
      expect(BinaryHexConverter.hexToBinary('A')).toBe('1010');
      expect(BinaryHexConverter.hexToBinary('F')).toBe('1111');
    });

    it('should convert multiple hex digits to binary', () => {
      expect(BinaryHexConverter.hexToBinary('FF')).toBe('11111111');
      expect(BinaryHexConverter.hexToBinary('00')).toBe('00000000');
      expect(BinaryHexConverter.hexToBinary('A5')).toBe('10100101');
    });

    it('should handle lowercase hex', () => {
      expect(BinaryHexConverter.hexToBinary('a')).toBe('1010');
      expect(BinaryHexConverter.hexToBinary('ff')).toBe('11111111');
      expect(BinaryHexConverter.hexToBinary('abc')).toBe('101010111100');
    });

    it('should handle mixed case hex', () => {
      expect(BinaryHexConverter.hexToBinary('AbC')).toBe('101010111100');
      expect(BinaryHexConverter.hexToBinary('fF')).toBe('11111111');
    });

    it('should handle long hex strings', () => {
      const hex = '123456789ABCDEF0';
      const result = BinaryHexConverter.hexToBinary(hex);
      
      expect(result).toHaveLength(64); // 16 hex digits * 4 bits each
      expect(result).toMatch(/^[01]+$/);
    });

    it('should throw error for invalid hex characters', () => {
      expect(() => BinaryHexConverter.hexToBinary('G')).toThrow('Invalid hexadecimal string');
      expect(() => BinaryHexConverter.hexToBinary('XY')).toThrow('Invalid hexadecimal string');
      expect(() => BinaryHexConverter.hexToBinary('123G')).toThrow('Invalid hexadecimal string');
    });

    it('should throw error for special characters', () => {
      expect(() => BinaryHexConverter.hexToBinary('@')).toThrow('Invalid hexadecimal string');
      expect(() => BinaryHexConverter.hexToBinary('12@3')).toThrow('Invalid hexadecimal string');
      expect(() => BinaryHexConverter.hexToBinary(' ')).toThrow('Invalid hexadecimal string');
    });

    it('should throw error for empty string', () => {
      expect(() => BinaryHexConverter.hexToBinary('')).toThrow('Invalid hexadecimal string');
    });
  });

  describe('binaryToHex', () => {
    it('should convert single nibble to hex', () => {
      expect(BinaryHexConverter.binaryToHex('0000')).toBe('0');
      expect(BinaryHexConverter.binaryToHex('0001')).toBe('1');
      expect(BinaryHexConverter.binaryToHex('1010')).toBe('a');
      expect(BinaryHexConverter.binaryToHex('1111')).toBe('f');
    });

    it('should convert multiple nibbles to hex', () => {
      expect(BinaryHexConverter.binaryToHex('11111111')).toBe('ff');
      expect(BinaryHexConverter.binaryToHex('00000000')).toBe('00');
      expect(BinaryHexConverter.binaryToHex('10100101')).toBe('a5');
    });

    it('should pad binary to nibble boundary', () => {
      expect(BinaryHexConverter.binaryToHex('1')).toBe('1');
      expect(BinaryHexConverter.binaryToHex('10')).toBe('2');
      expect(BinaryHexConverter.binaryToHex('101')).toBe('5');
      expect(BinaryHexConverter.binaryToHex('1010')).toBe('a');
    });

    it('should handle long binary strings', () => {
      const binary = '1010101111001101111011110000';
      const result = BinaryHexConverter.binaryToHex(binary);
      
      expect(result).toMatch(/^[0-9a-f]+$/);
      expect(result).toHaveLength(7); // 28 bits = 7 hex digits
    });

    it('should handle binary with leading zeros', () => {
      expect(BinaryHexConverter.binaryToHex('00001010')).toBe('0a');
      expect(BinaryHexConverter.binaryToHex('000000000001')).toBe('001');
    });

    it('should throw error for invalid binary characters', () => {
      expect(() => BinaryHexConverter.binaryToHex('2')).toThrow('Invalid binary string');
      expect(() => BinaryHexConverter.binaryToHex('102')).toThrow('Invalid binary string');
      expect(() => BinaryHexConverter.binaryToHex('abc')).toThrow('Invalid binary string');
    });

    it('should throw error for special characters', () => {
      expect(() => BinaryHexConverter.binaryToHex('@')).toThrow('Invalid binary string');
      expect(() => BinaryHexConverter.binaryToHex('10@1')).toThrow('Invalid binary string');
      expect(() => BinaryHexConverter.binaryToHex(' ')).toThrow('Invalid binary string');
    });

    it('should throw error for empty string', () => {
      expect(() => BinaryHexConverter.binaryToHex('')).toThrow('Invalid binary string');
    });
  });

  describe('round trip conversion', () => {
    it('should maintain data integrity hex->binary->hex', () => {
      const originalHex = 'ABCDEF123456';
      const binary = BinaryHexConverter.hexToBinary(originalHex);
      const backToHex = BinaryHexConverter.binaryToHex(binary);
      
      expect(backToHex.toUpperCase()).toBe(originalHex);
    });

    it('should maintain data integrity binary->hex->binary', () => {
      const originalBinary = '101010111100110111110000';
      const hex = BinaryHexConverter.binaryToHex(originalBinary);
      const backToBinary = BinaryHexConverter.hexToBinary(hex);
      
      // Pad original to match expected output
      const paddedOriginal = originalBinary.padStart(Math.ceil(originalBinary.length / 4) * 4, '0');
      expect(backToBinary).toBe(paddedOriginal);
    });

    it('should handle edge cases in round trip', () => {
      const testCases = ['0', 'F', '00', 'FF', '123', 'ABC', 'DEF'];
      
      testCases.forEach(hex => {
        const binary = BinaryHexConverter.hexToBinary(hex);
        const backToHex = BinaryHexConverter.binaryToHex(binary);
        expect(backToHex.toUpperCase()).toBe(hex);
      });
    });
  });

  describe('private methods coverage', () => {
    it('should test padBinaryToNibble through public interface', () => {
      // Test cases that exercise the padding logic
      expect(BinaryHexConverter.binaryToHex('1')).toBe('1'); // 0001 -> 1
      expect(BinaryHexConverter.binaryToHex('11')).toBe('3'); // 0011 -> 3
      expect(BinaryHexConverter.binaryToHex('111')).toBe('7'); // 0111 -> 7
    });

    it('should test leftPad through public interface', () => {
      // Test cases that exercise the left padding logic
      expect(BinaryHexConverter.hexToBinary('1')).toBe('0001');
      expect(BinaryHexConverter.hexToBinary('A')).toBe('1010');
    });

    it('should test validation methods through public interface', () => {
      // Hex validation
      expect(() => BinaryHexConverter.hexToBinary('Z')).toThrow();
      expect(() => BinaryHexConverter.hexToBinary('!')).toThrow();
      
      // Binary validation  
      expect(() => BinaryHexConverter.binaryToHex('2')).toThrow();
      expect(() => BinaryHexConverter.binaryToHex('a')).toThrow();
    });
  });
});