import { BitBuffer } from '../../../domain/qr/infrastructure/bit-buffer';
import { find_path } from '../../../domain/qr/infrastructure/dijkstra';
import { AlignmentPattern } from '../../../domain/qr/infrastructure/alignment-pattern';
import { ErrorCorrectionCode } from '../../../domain/qr/infrastructure/error-correction-code';
import * as GF from '../../../domain/qr/infrastructure/galois-field';

describe('QR Infrastructure', () => {
  describe('BitBuffer', () => {
    it('should initialize empty buffer', () => {
      const buffer = new BitBuffer();
      expect(buffer.length).toBe(0);
      expect(buffer.buffer).toEqual([]);
    });

    it('should put and get bits', () => {
      const buffer = new BitBuffer();
      buffer.putBit(true);
      buffer.putBit(false);
      buffer.putBit(true);

      expect(buffer.get(0)).toBe(true);
      expect(buffer.get(1)).toBe(false);
      expect(buffer.get(2)).toBe(true);
      expect(buffer.length).toBe(3);
    });

    it('should put number with length', () => {
      const buffer = new BitBuffer();
      buffer.put(5, 4); // 0101 in binary

      expect(buffer.get(0)).toBe(false);
      expect(buffer.get(1)).toBe(true);
      expect(buffer.get(2)).toBe(false);
      expect(buffer.get(3)).toBe(true);
    });

    it('should get length in bits', () => {
      const buffer = new BitBuffer();
      buffer.put(255, 8);
      expect(buffer.getLengthInBits()).toBe(8);
    });

    it('should handle multiple bytes', () => {
      const buffer = new BitBuffer();
      buffer.put(255, 8);
      buffer.put(0, 8);
      expect(buffer.length).toBe(16);
    });

    it('should handle large numbers', () => {
      const buffer = new BitBuffer();
      buffer.put(1023, 10);
      expect(buffer.length).toBe(10);
    });

    it('should handle zero', () => {
      const buffer = new BitBuffer();
      buffer.put(0, 8);
      expect(buffer.length).toBe(8);
      expect(buffer.get(0)).toBe(false);
    });
  });

  describe('Dijkstra', () => {
    it('should find shortest path', () => {
      const graph = {
        a: { b: 1, c: 4 },
        b: { c: 2, d: 5 },
        c: { d: 1 },
        d: {}
      };

      const path = find_path(graph, 'a', 'd');
      expect(path).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should handle direct path', () => {
      const graph = {
        a: { b: 1 },
        b: {}
      };

      const path = find_path(graph, 'a', 'b');
      expect(path).toEqual(['a', 'b']);
    });

    it('should handle single node path', () => {
      const graph = {
        a: {}
      };

      const path = find_path(graph, 'a', 'a');
      expect(path).toEqual(['a']);
    });

    it('should handle complex graph', () => {
      const graph = {
        start: { a: 5, b: 2 },
        a: { c: 4, d: 2 },
        b: { a: 8, d: 7 },
        c: { end: 3 },
        d: { c: 6, end: 1 },
        end: {}
      };

      const path = find_path(graph, 'start', 'end');
      expect(path).toBeDefined();
      expect(path[0]).toBe('start');
      expect(path[path.length - 1]).toBe('end');
    });
  });

  describe('AlignmentPattern', () => {
    it('should return empty array for version 1', () => {
      const positions = AlignmentPattern.getPositions(1);
      expect(positions).toEqual([]);
    });

    it('should return positions for version 2', () => {
      const positions = AlignmentPattern.getPositions(2);
      expect(positions.length).toBeGreaterThan(0);
    });

    it('should return positions for higher versions', () => {
      const positions = AlignmentPattern.getPositions(7);
      expect(positions.length).toBeGreaterThan(0);
    });
  });

  describe('ErrorCorrectionCode', () => {
    it('should get blocks count for version and level', () => {
      const { L } = require('../../../domain/qr/value-objects/error-correction-level');
      const blocks = ErrorCorrectionCode.getBlocksCount(1, L);
      expect(blocks).toBeGreaterThan(0);
    });

    it('should get total codewords count', () => {
      const { M } = require('../../../domain/qr/value-objects/error-correction-level');
      const count = ErrorCorrectionCode.getTotalCodewordsCount(1, M);
      expect(count).toBeGreaterThan(0);
    });

    it('should handle different versions', () => {
      const { L } = require('../../../domain/qr/value-objects/error-correction-level');
      const blocks1 = ErrorCorrectionCode.getBlocksCount(1, L);
      const blocks5 = ErrorCorrectionCode.getBlocksCount(5, L);
      expect(blocks1).toBeDefined();
      expect(blocks5).toBeDefined();
    });

    it('should handle different error correction levels', () => {
      const { L, H } = require('../../../domain/qr/value-objects/error-correction-level');
      const blocksL = ErrorCorrectionCode.getBlocksCount(5, L);
      const blocksH = ErrorCorrectionCode.getBlocksCount(5, H);
      expect(blocksL).toBeDefined();
      expect(blocksH).toBeDefined();
    });
  });

  describe('GaloisField', () => {
    it('should multiply values', () => {
      const result = GF.mul(2, 3);
      expect(typeof result).toBe('number');
      expect(GF.mul(0, 5)).toBe(0);
      expect(GF.mul(5, 0)).toBe(0);
    });

    it('should handle exp operation', () => {
      const result = GF.exp(5);
      expect(typeof result).toBe('number');
      expect(GF.exp(0)).toBeDefined();
      expect(GF.exp(255)).toBeDefined();
    });

    it('should handle log operation', () => {
      const result = GF.log(5);
      expect(typeof result).toBe('number');
      expect(GF.log(1)).toBeDefined();
      expect(GF.log(255)).toBeDefined();
    });

    it('should throw error for log of 0', () => {
      expect(() => GF.log(0)).toThrow();
    });
  });
});
