import { ReedSolomonEncoder } from '../../../domain/qr/infrastructure/reed-solomon-encoder';

describe('ReedSolomonEncoder', () => {
  describe('constructor', () => {
    it('should initialize with degree', () => {
      const encoder = new ReedSolomonEncoder(10);
      expect(encoder).toBeDefined();
    });

    it('should initialize with zero degree', () => {
      const encoder = new ReedSolomonEncoder(0);
      expect(encoder).toBeDefined();
    });
  });

  describe('initialize', () => {
    it('should initialize encoder with degree', () => {
      const encoder = new ReedSolomonEncoder(0);
      encoder.initialize(5);
      
      const data = new Uint8Array([1, 2, 3]);
      const result = encoder.encode(data);
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe('encode', () => {
    it('should encode data', () => {
      const encoder = new ReedSolomonEncoder(10);
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const result = encoder.encode(data);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(10);
    });

    it('should throw error if not initialized', () => {
      const encoder = new ReedSolomonEncoder(0);
      const data = new Uint8Array([1, 2, 3]);
      
      expect(() => encoder.encode(data)).toThrow('Encoder not initialized');
    });

    it('should handle empty data', () => {
      const encoder = new ReedSolomonEncoder(5);
      const data = new Uint8Array([]);
      const result = encoder.encode(data);
      
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle remainder smaller than degree', () => {
      const encoder = new ReedSolomonEncoder(10);
      const data = new Uint8Array([255]);
      const result = encoder.encode(data);
      
      expect(result.length).toBe(10);
    });
  });
});
