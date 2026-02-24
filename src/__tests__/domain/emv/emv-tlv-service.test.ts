import { EMVTLVService } from '../../../domain/emv/services/emv-tlv-service';

describe('EMVTLVService', () => {
  describe('parse', () => {
    it('should parse simple TLV', () => {
      // Tag 00, Length 02, Value 01
      const input = '00020120'; // 01 and 20 (space?) 01 is 1 char? No 2 hex chars is 1 byte?
      // Wait, the service documentation says slice(offset, offset+length). 
      // In typical EMV hex strings, length is bytes, but logic is input.slice(offset, offset+length).
      // If input is '0002AB', length is 2. value = 'AB'.
      // So input string length corresponds to "length" count directly in this parser implementation?
      // Let's look at code: 
      // const value = input.slice(offset, offset + length);
      // So yes, 'length' is number of characters in the input string.

      const inputStr = '0002AB';
      const nodes = EMVTLVService.parse(inputStr);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].tag).toBe('00');
      expect(nodes[0].length).toBe(2);
      expect(nodes[0].value).toBe('AB');
    });

    it('should parse nested TLV (subtags)', () => {
      // Template Tag 62, Length 08.
      // Content: Subtag 01, Length 02, Value AB. Subtag 02, Length 02, Value CD.
      // 01 02 AB 02 02 CD = 2+2+2 + 2+2+2 = 12 chars?
      // Parser logic:
      // subtags loop: tag(2), len(2), value(length). Total size = 4 + length.
      // 01 02 AB -> Tag='01', Len=2, Val='AB'. Total 8? No. 
      // value.slice(offset, offset+2) -> Tag.
      // value.slice(offset+2, offset+4) -> Len.
      // value.slice(offset+4, offset+4+length) -> Val.
      // So input '0102AB'. Tag=01, Len=02. Val=AB.

      const sub1 = '0102AB';
      const sub2 = '0202CD';
      const templateValue = sub1 + sub2; // 0102AB0202CD (length 12)
      const input = '6212' + templateValue;

      const nodes = EMVTLVService.parse(input);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].tag).toBe('62');
      expect(nodes[0].subtags).toBeDefined();
      expect(nodes[0].subtags).toHaveLength(2);
      expect(nodes[0].subtags![0].tag).toBe('01');
      expect(nodes[0].subtags![1].value).toBe('CD');
    });

    it('should throw on invalid length', () => {
      expect(() => EMVTLVService.parse('00XX')).toThrow('Invalid length');
    });

    it('should throw on length mismatch', () => {
      // Declared 04, actual 02
      expect(() => EMVTLVService.parse('0004AB')).toThrow('Length mismatch');
    });

    it('should handle tryParseSubTLV failure (graceful fallback to value)', () => {
      // If inner parse fails, it returns null and sets node.value
      // Case: Inner length invalid
      const invalidSub = '01XXAB'; // Invalid length
      const input = '6206' + invalidSub;

      const nodes = EMVTLVService.parse(input);
      expect(nodes[0].subtags).toBeUndefined();
      expect(nodes[0].value).toBe(invalidSub);
    });

    it('should handle tryParseSubTLV overflow', () => {
      // Inner declares length 04 but only provides 02
      const partialSub = '0104AB';
      const input = '6206' + partialSub;

      const nodes = EMVTLVService.parse(input);
      expect(nodes[0].subtags).toBeUndefined();
      expect(nodes[0].value).toBe(partialSub);
    });

    it('should handle tryParseSubTLV garbage', () => {
      // Not enough data for header
      const garbage = '01';
      const input = '6202' + garbage;
      const nodes = EMVTLVService.parse(input);
      expect(nodes[0].subtags).toBeUndefined();
    });
  });
});
