import { BinaryToPng } from '../../../domain/qr/infrastructure/binary-png';

describe('BinaryToPng', () => {
  describe('base64ToBinary', () => {
    it('should convert base64 to binary string in Node environment', () => {
      const base64 = Buffer.from([255, 0, 128]).toString('base64');
      const binary = BinaryToPng.base64ToBinary(base64);
      expect(binary).toContain('11111111');
      expect(binary).toContain('00000000');
      expect(binary).toContain('10000000');
    });

    it('should handle empty base64', () => {
      const binary = BinaryToPng.base64ToBinary('');
      expect(binary).toBe('');
    });

    it('should pad binary to 8 bits', () => {
      const base64 = Buffer.from([1]).toString('base64');
      const binary = BinaryToPng.base64ToBinary(base64);
      expect(binary).toBe('00000001');
    });

    it('should handle multiple bytes', () => {
      const base64 = Buffer.from([255, 255, 0]).toString('base64');
      const binary = BinaryToPng.base64ToBinary(base64);
      expect(binary.length).toBe(24);
    });
  });

  describe('binaryToPNG', () => {
    it('should generate PNG from binary data', async () => {
      const binary = '1111000011110000';
      const rows = 4;
      const png = await BinaryToPng.binaryToPNG({ binary, rows, scale: 1 });
      
      expect(png).toBeInstanceOf(Uint8Array);
      expect(png[0]).toBe(0x89);
      expect(png[1]).toBe(0x50);
      expect(png[2]).toBe(0x4e);
      expect(png[3]).toBe(0x47);
    });

    it('should throw error for insufficient binary data', async () => {
      const binary = '111';
      const rows = 4;
      
      await expect(
        BinaryToPng.binaryToPNG({ binary, rows, scale: 1 })
      ).rejects.toThrow('Insufficient binary');
    });

    it('should handle reversed colors', async () => {
      const binary = '1111000011110000';
      const rows = 4;
      const png = await BinaryToPng.binaryToPNG({ 
        binary, 
        rows, 
        scale: 1, 
        reversed: true 
      });
      
      expect(png).toBeInstanceOf(Uint8Array);
    });

    it('should handle different scales', async () => {
      const binary = '1111000011110000';
      const rows = 4;
      const png = await BinaryToPng.binaryToPNG({ binary, rows, scale: 5 });
      
      expect(png).toBeInstanceOf(Uint8Array);
      expect(png.length).toBeGreaterThan(0);
    });

    it('should handle default scale', async () => {
      const binary = '1111000011110000';
      const rows = 4;
      const png = await BinaryToPng.binaryToPNG({ binary, rows, scale: 10 });
      
      expect(png).toBeInstanceOf(Uint8Array);
    });

    it('should create valid PNG structure', async () => {
      const binary = '10'.repeat(8);
      const rows = 4;
      const png = await BinaryToPng.binaryToPNG({ binary, rows, scale: 2 });
      
      const pngString = String.fromCharCode(...png.slice(0, 8));
      expect(pngString).toContain('PNG');
    });

    it('should handle exact binary length', async () => {
      const binary = '1'.repeat(16);
      const rows = 4;
      const png = await BinaryToPng.binaryToPNG({ binary, rows, scale: 1 });
      expect(png).toBeInstanceOf(Uint8Array);
    });

    it('should handle large scale', async () => {
      const binary = '1010';
      const rows = 2;
      const png = await BinaryToPng.binaryToPNG({ binary, rows, scale: 20 });
      expect(png.length).toBeGreaterThan(100);
    });
  });
});
