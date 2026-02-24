import * as Segments from '../../../domain/qr/infrastructure/segments';
import * as Mode from '../../../domain/qr/value-objects/encoding-mode';
import { setToSJISFunction } from '../../../domain/qr/infrastructure/qr-utils';

describe('Segments', () => {
  describe('fromArray', () => {
    it('should create segments from string array', () => {
      const result = Segments.fromArray(['123', 'ABC']);
      expect(result).toHaveLength(2);
      expect(result[0].mode).toBe(Mode.NUMERIC);
      expect(result[1].mode).toBe(Mode.ALPHANUMERIC);
    });

    it('should create segments from object array', () => {
      const result = Segments.fromArray([
        { data: '123', mode: Mode.NUMERIC },
        { data: 'ABC', mode: Mode.ALPHANUMERIC }
      ]);
      expect(result).toHaveLength(2);
    });

    it('should handle mixed array', () => {
      const result = Segments.fromArray([
        '123',
        { data: 'ABC' }
      ]);
      expect(result).toHaveLength(2);
    });

    it('should handle byte mode', () => {
      const result = Segments.fromArray([{ data: 'test@123', mode: Mode.BYTE }]);
      expect(result).toHaveLength(1);
      expect(result[0].mode).toBe(Mode.BYTE);
    });

    it('should handle kanji mode when enabled', () => {
      setToSJISFunction(() => 0x8140);
      const result = Segments.fromArray([{ data: '漢字', mode: Mode.KANJI }]);
      expect(result).toHaveLength(1);
    });

    it('should throw error for incompatible mode', () => {
      expect(() => {
        Segments.fromArray([{ data: 'abc@123', mode: Mode.NUMERIC }]);
      }).toThrow('cannot be encoded');
    });

    it('should handle empty array', () => {
      const result = Segments.fromArray([]);
      expect(result).toHaveLength(0);
    });

    it('should handle objects without data', () => {
      const result = Segments.fromArray([{ mode: Mode.NUMERIC } as any]);
      expect(result).toHaveLength(0);
    });
  });

  describe('fromString', () => {
    beforeEach(() => {
      setToSJISFunction(() => 0x8140);
    });

    it('should create optimized segments from string', () => {
      const result = Segments.fromString('123ABC', 1);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle numeric only', () => {
      const result = Segments.fromString('123456', 1);
      expect(result).toHaveLength(1);
      expect(result[0].mode).toBe(Mode.NUMERIC);
    });

    it('should handle alphanumeric only', () => {
      const result = Segments.fromString('ABCDEF', 1);
      expect(result).toHaveLength(1);
      expect(result[0].mode).toBe(Mode.ALPHANUMERIC);
    });

    it('should handle byte data', () => {
      const result = Segments.fromString('test@example.com', 1);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle mixed data', () => {
      const result = Segments.fromString('123ABCabc', 1);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should optimize segments', () => {
      const result = Segments.fromString('111AAA222BBB', 1);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle kanji characters when enabled', () => {
      setToSJISFunction(() => 0x8140);
      const result = Segments.fromString('漢字', 1);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle different versions', () => {
      const result1 = Segments.fromString('test', 1);
      const result10 = Segments.fromString('test', 10);
      const result27 = Segments.fromString('test', 27);
      expect(result1).toBeDefined();
      expect(result10).toBeDefined();
      expect(result27).toBeDefined();
    });

    it('should merge consecutive segments of same mode', () => {
      const result = Segments.fromString('111222333', 1);
      expect(result).toHaveLength(1);
    });
  });

  describe('rawSplit', () => {
    beforeEach(() => {
      setToSJISFunction(() => 0x8140);
    });

    it('should split string into raw segments', () => {
      const result = Segments.rawSplit('123ABC');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle numeric segments', () => {
      const result = Segments.rawSplit('123');
      expect(result).toHaveLength(1);
      expect(result[0].mode).toBe(Mode.NUMERIC);
    });

    it('should handle alphanumeric segments', () => {
      const result = Segments.rawSplit('ABC');
      expect(result).toHaveLength(1);
      expect(result[0].mode).toBe(Mode.ALPHANUMERIC);
    });

    it('should handle byte segments', () => {
      const result = Segments.rawSplit('abc@123');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle mixed segments', () => {
      const result = Segments.rawSplit('123ABCabc');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle kanji segments when enabled', () => {
      setToSJISFunction(() => 0x8140);
      const result = Segments.rawSplit('漢字');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty string', () => {
      const result = Segments.rawSplit('');
      expect(result).toHaveLength(0);
    });

    it('should handle complex mixed data', () => {
      const result = Segments.rawSplit('123ABC漢字abc@test');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle kanji mode in buildNodes', () => {
      setToSJISFunction(() => 0x8140);
      const result = Segments.fromString('漢', 1);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
