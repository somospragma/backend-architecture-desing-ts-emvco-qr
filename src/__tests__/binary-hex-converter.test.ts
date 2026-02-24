import { BinaryHexConverter } from '../shared/utils/binary-hex-converter';

describe('BinaryHexConverter', () => {
  describe('hexToBinary', () => {
    it('should convert hex to binary', () => {
      expect(BinaryHexConverter.hexToBinary('A')).toBe('1010');
      expect(BinaryHexConverter.hexToBinary('FF')).toBe('11111111');
      expect(BinaryHexConverter.hexToBinary('00')).toBe('00000000');
    });

    it('should throw error for invalid hex', () => {
      expect(() => BinaryHexConverter.hexToBinary('G')).toThrow('Invalid hexadecimal string');
      expect(() => BinaryHexConverter.hexToBinary('XY')).toThrow('Invalid hexadecimal string');
    });
  });

  describe('binaryToHex', () => {
    it('should convert binary to hex', () => {
      expect(BinaryHexConverter.binaryToHex('1010')).toBe('a');
      expect(BinaryHexConverter.binaryToHex('11111111')).toBe('ff');
      expect(BinaryHexConverter.binaryToHex('101')).toBe('5');
    });

    it('should throw error for invalid binary', () => {
      expect(() => BinaryHexConverter.binaryToHex('102')).toThrow('Invalid binary string');
      expect(() => BinaryHexConverter.binaryToHex('abc')).toThrow('Invalid binary string');
    });
  });

  describe('round trip conversion', () => {
    it('should maintain data integrity', () => {
      const original = 'ABCDEF';
      const binary = BinaryHexConverter.hexToBinary(original);
      const backToHex = BinaryHexConverter.binaryToHex(binary);
      expect(backToHex.toUpperCase()).toBe(original);
    });
  });
});