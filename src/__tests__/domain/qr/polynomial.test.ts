import * as Polynomial from '../../../domain/qr/infrastructure/polynomial';

describe('Polynomial', () => {
  describe('mul', () => {
    it('should multiply two polynomials', () => {
      const p1 = new Uint8Array([1, 2]);
      const p2 = new Uint8Array([3, 4]);
      const result = Polynomial.mul(p1, p2);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(3);
    });

    it('should handle single element polynomials', () => {
      const p1 = new Uint8Array([5]);
      const p2 = new Uint8Array([3]);
      const result = Polynomial.mul(p1, p2);
      
      expect(result.length).toBe(1);
    });

    it('should handle zero polynomial', () => {
      const p1 = new Uint8Array([0]);
      const p2 = new Uint8Array([5]);
      const result = Polynomial.mul(p1, p2);
      
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe('mod', () => {
    it('should calculate modulo of polynomials', () => {
      const dividend = new Uint8Array([1, 2, 3, 4]);
      const divisor = new Uint8Array([1, 2]);
      const result = Polynomial.mod(dividend, divisor);
      
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle when dividend is smaller than divisor', () => {
      const dividend = new Uint8Array([1]);
      const divisor = new Uint8Array([1, 2, 3]);
      const result = Polynomial.mod(dividend, divisor);
      
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle leading zeros', () => {
      const dividend = new Uint8Array([0, 0, 1, 2]);
      const divisor = new Uint8Array([1, 2]);
      const result = Polynomial.mod(dividend, divisor);
      
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe('generateECPolynomial', () => {
    it('should generate error correction polynomial', () => {
      const degree = 5;
      const poly = Polynomial.generateECPolynomial(degree);
      
      expect(poly).toBeInstanceOf(Uint8Array);
      expect(poly.length).toBe(degree + 1);
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
