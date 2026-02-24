import * as Polynomial from '../../../domain/qr/infrastructure/polynomial';
import { ReedSolomonEncoder } from '../../../domain/qr/infrastructure/reed-solomon-encoder';

describe('Polynomial and Reed-Solomon', () => {
  describe('Polynomial', () => {
    describe('mul', () => {
      it('should multiply two polynomials', () => {
        const p1 = new Uint8Array([1, 2]);
        const p2 = new Uint8Array([3, 4]);
        const result = Polynomial.mul(p1, p2);
        expect(result.length).toBe(3);
      });

      it('should handle single element polynomials', () => {
        const p1 = new Uint8Array([1]);
        const p2 = new Uint8Array([1]);
        const result = Polynomial.mul(p1, p2);
        expect(result.length).toBe(1);
      });
    });

    describe('mod', () => {
      it('should calculate modulo of polynomials', () => {
        const divident = new Uint8Array([1, 2, 3, 4]);
        const divisor = new Uint8Array([1, 2]);
        const result = Polynomial.mod(divident, divisor);
        expect(result).toBeDefined();
      });

      it('should handle exact division', () => {
        const divident = new Uint8Array([0, 0, 1]);
        const divisor = new Uint8Array([1]);
        const result = Polynomial.mod(divident, divisor);
        expect(result).toBeDefined();
      });
    });

    describe('generateECPolynomial', () => {
      it('should generate error correction polynomial', () => {
        const poly = Polynomial.generateECPolynomial(5);
        expect(poly.length).toBe(6);
      });

      it('should generate polynomial for degree 0', () => {
        const poly = Polynomial.generateECPolynomial(0);
        expect(poly.length).toBe(1);
      });

      it('should generate polynomial for degree 10', () => {
        const poly = Polynomial.generateECPolynomial(10);
        expect(poly.length).toBe(11);
      });
    });
  });

  describe('ReedSolomonEncoder', () => {
    it('should create encoder with degree', () => {
      const encoder = new ReedSolomonEncoder(10);
      expect(encoder).toBeDefined();
    });

    it('should initialize encoder', () => {
      const encoder = new ReedSolomonEncoder(0);
      encoder.initialize(10);
      expect(encoder).toBeDefined();
    });

    it('should encode data', () => {
      const encoder = new ReedSolomonEncoder(10);
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const result = encoder.encode(data);
      expect(result.length).toBe(10);
    });

    it('should throw error if not initialized', () => {
      const encoder = new ReedSolomonEncoder(0);
      const data = new Uint8Array([1, 2, 3]);
      expect(() => encoder.encode(data)).toThrow('Encoder not initialized');
    });

    it('should handle small remainder', () => {
      const encoder = new ReedSolomonEncoder(10);
      const data = new Uint8Array([1]);
      const result = encoder.encode(data);
      expect(result.length).toBe(10);
    });

    it('should handle large data', () => {
      const encoder = new ReedSolomonEncoder(10);
      const data = new Uint8Array(50).fill(1);
      const result = encoder.encode(data);
      expect(result.length).toBe(10);
    });

    it('should handle case where remainder length is less than degree (padding needed)', () => {
      // Logic: start = degree - remainder.length. If start > 0, checks padding.
      // We need remainder length < degree.
      // Mock mod to return short array.
      const spy = jest.spyOn(Polynomial, 'mod').mockReturnValue(new Uint8Array([1]));

      const encoder = new ReedSolomonEncoder(10);
      const data = new Uint8Array([1]);
      const result = encoder.encode(data);

      expect(result.length).toBe(10);
      expect(result[9]).toBe(1); // last byte is 1, rest 0

      spy.mockRestore();
    });
  });
});
