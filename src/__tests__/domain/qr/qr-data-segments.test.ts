import { NumericData } from '../../../domain/qr/entities/data-segments/numeric-data';
import { AlphanumericData } from '../../../domain/qr/entities/data-segments/alphanumeric-data';
import { ByteData } from '../../../domain/qr/entities/data-segments/byte-data';
import { KanjiData } from '../../../domain/qr/entities/data-segments/kanji-data';
import { BitBuffer } from '../../../domain/qr/infrastructure/bit-buffer';
import * as Mode from '../../../domain/qr/value-objects/encoding-mode';
import { setToSJISFunction } from '../../../domain/qr/infrastructure/qr-utils';

describe('QR Data Segments', () => {
  describe('NumericData', () => {
    it('should have correct mode and length', () => {
      const data = new NumericData('123');
      expect(data.mode.id).toBe('Numeric');
      expect(data.getLength()).toBe(3);
      expect(data.mode.bit).toBe(1);
    });

    it('should create from string', () => {
      const data = new NumericData('12345');
      expect(data.data).toBe('12345');
      expect(data.mode).toBe(Mode.NUMERIC);
    });

    it('should create from number', () => {
      const data = new NumericData(12345);
      expect(data.data).toBe('12345');
      expect(data.mode).toBe(Mode.NUMERIC);
    });

    it('should get length', () => {
      const data = new NumericData('12345');
      expect(data.getLength()).toBe(5);
    });

    it('should calculate bits length', () => {
      expect(NumericData.getBitsLength(3)).toBe(10);
      expect(NumericData.getBitsLength(4)).toBe(14);
      expect(NumericData.getBitsLength(5)).toBe(17);
      expect(NumericData.getBitsLength(1)).toBe(4);
      expect(NumericData.getBitsLength(2)).toBe(7);
    });

    it('should get bits length', () => {
      const data = new NumericData('123');
      expect(data.getBitsLength()).toBe(10);
    });

    it('should write to bit buffer', () => {
      const data = new NumericData('12345');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write groups of 3 digits', () => {
      const data = new NumericData('123456');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBe(20);
    });

    it('should handle remaining digits', () => {
      const data = new NumericData('1234');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBe(14);
    });

    it('should handle single digit', () => {
      const data = new NumericData('5');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBe(4);
    });
  });

  describe('AlphanumericData', () => {
    it('should have correct mode and length', () => {
      const data = new AlphanumericData('A');
      expect(data.mode).toBeDefined();
      expect(data.mode.id).toBe('Alphanumeric');
      expect(data.getLength()).toBe(1);
    });

    it('should create from string', () => {
      const data = new AlphanumericData('ABC123');
      expect(data.data).toBe('ABC123');
      expect(data.mode).toBe(Mode.ALPHANUMERIC);
      expect(data.mode.bit).toBe(2);
    });

    it('should get length', () => {
      const data = new AlphanumericData('ABC');
      expect(data.getLength()).toBe(3);
    });

    it('should calculate bits length', () => {
      expect(AlphanumericData.getBitsLength(2)).toBe(11);
      expect(AlphanumericData.getBitsLength(3)).toBe(17);
      expect(AlphanumericData.getBitsLength(1)).toBe(6);
      expect(AlphanumericData.getBitsLength(4)).toBe(22);
    });

    it('should get bits length', () => {
      const data = new AlphanumericData('AB');
      expect(data.getBitsLength()).toBe(11);
    });

    it('should write to bit buffer', () => {
      const data = new AlphanumericData('ABC');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle pairs of characters', () => {
      const data = new AlphanumericData('ABCD');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBe(22);
    });

    it('should handle odd number of characters', () => {
      const data = new AlphanumericData('ABC');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBe(17);
    });

    it('should handle full range of alphanumeric characters', () => {
      const allChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
      const data = new AlphanumericData(allChars);
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle single character', () => {
      const data = new AlphanumericData('Z');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBe(6);
    });
  });

  describe('ByteData', () => {
    it('should create from string', () => {
      const data = new ByteData('test');
      expect(data.data).toBeDefined();
      expect(data.mode).toBe(Mode.BYTE);
      expect(data.mode.bit).toBe(4);
    });

    it('should create from buffer', () => {
      const buffer = Buffer.from('test');
      const data = new ByteData(buffer);
      expect(data.data).toBeDefined();
    });

    it('should create from Uint8Array', () => {
      const arr = new Uint8Array([1, 2, 3]);
      const data = new ByteData(arr);
      expect(data.data.length).toBe(3);
      expect(data.getLength()).toBe(3);
    });

    it('should get length', () => {
      const data = new ByteData('test');
      expect(data.getLength()).toBe(4);
    });

    it('should calculate bits length', () => {
      expect(ByteData.getBitsLength(4)).toBe(32);
      expect(ByteData.getBitsLength(1)).toBe(8);
      expect(ByteData.getBitsLength(10)).toBe(80);
    });

    it('should get bits length', () => {
      const data = new ByteData('test');
      expect(data.getBitsLength()).toBe(32);
    });

    it('should write to bit buffer', () => {
      const data = new ByteData('test');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBe(32);
    });

    it('should handle empty string', () => {
      const data = new ByteData('');
      expect(data.getLength()).toBe(0);
    });
  });

  describe('KanjiData', () => {
    beforeEach(() => {
      setToSJISFunction((char) => {
        if (char === '点') return 0x935c;
        if (char === '漢') return 0x8abf;
        if (char === '字') return 0x8e9a;
        if (char === '纊') return 0xe040; // Second range
        if (char === 'a') return 0x0001; // Invalid for Kanji range
        return 0x8140; // Default valid
      });
    });

    it('should create from string', () => {
      const data = new KanjiData('漢字');
      expect(data.data).toBeDefined();
      expect(data.mode).toBe(Mode.KANJI);
    });

    it('should get length', () => {
      const data = new KanjiData('漢字');
      expect(data.getLength()).toBeGreaterThan(0);
    });

    it('should calculate bits length', () => {
      expect(KanjiData.getBitsLength(2)).toBe(26);
      expect(KanjiData.getBitsLength(1)).toBe(13);
      expect(KanjiData.getBitsLength(3)).toBe(39);
    });

    it('should get bits length', () => {
      const data = new KanjiData('漢');
      expect(data.getBitsLength()).toBeGreaterThan(0);
    });

    it('should write to bit buffer', () => {
      const data = new KanjiData('漢字');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBe(26);
    });

    it('should handle first range of Kanji characters (0x8140-0x9ffc)', () => {
      const data = new KanjiData('点');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBe(13);
    });

    it('should handle second range of Kanji characters (0xe040-0xebbf)', () => {
      const data = new KanjiData('纊');
      const buffer = new BitBuffer();
      data.write(buffer);
      expect(buffer.length).toBe(13);
    });

    it('should throw error for invalid SJIS character', () => {
      const data = new KanjiData('a');
      const buffer = new BitBuffer();
      expect(() => data.write(buffer)).toThrow('Invalid SJIS character');
    });
  });
});
