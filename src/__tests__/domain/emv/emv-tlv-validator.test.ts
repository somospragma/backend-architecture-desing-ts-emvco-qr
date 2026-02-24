import { EMVTLVValidator } from '../../../domain/emv/services/emv-tlv-validator';
import { CRCService } from '../../../domain/crypto/services/crc-service';

describe('EMVTLVValidator', () => {
  describe('validate', () => {
    it('should detect missing tag 00', () => {
      const tlv = '010211' + '6304ABCD';
      const result = EMVTLVValidator.validate(tlv);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Tag 00'))).toBe(true);
    });

    it('should detect missing tag 63', () => {
      const tlv = '000201010211';
      const result = EMVTLVValidator.validate(tlv);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Tag 63'))).toBe(true);
    });

    it('should detect invalid tag 00 value', () => {
      const base = '000202010211';
      const tlv = base + '6304' + CRCService.calculateCRC16(base + '6304');
      const result = EMVTLVValidator.validate(tlv);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("Tag 00: Must be '01'"))).toBe(true);
    });

    it('should detect invalid tag 01 value', () => {
      const base = '000201010299';
      const tlv = base + '6304' + CRCService.calculateCRC16(base + '6304');
      const result = EMVTLVValidator.validate(tlv);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("Tag 01: Must be '11' or '12'"))).toBe(true);
    });

    it('should detect missing required tags', () => {
      const base = '000201';
      const tlv = base + '6304' + CRCService.calculateCRC16(base + '6304');
      const result = EMVTLVValidator.validate(tlv);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Required tag'))).toBe(true);
    });

    it('should detect invalid CRC', () => {
      const tlv = '0002016304FFFF';
      const result = EMVTLVValidator.validate(tlv);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid CRC'))).toBe(true);
    });

    it('should detect missing CRC tag', () => {
      const tlv = '000201';
      const result = EMVTLVValidator.validate(tlv);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('CRC tag (63) not found'))).toBe(true);
    });

    it('should handle parse errors', () => {
      const result = EMVTLVValidator.validate('INVALID');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Parse error'))).toBe(true);
    });

    it('should validate length mismatch', () => {
      // Declared length 03, but providing value '05' (length 2 chars = 1 byte)
      const tlv = '000305';
      const result = EMVTLVValidator.validate(tlv);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Length mismatch'))).toBe(true);
    });

    it('should detect max length exceeded for tag', () => {
      const service = require('../../../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([{
        tag: '01',
        length: 100,
        value: 'A'.repeat(100),
        subtags: []
      }]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('exceeds maximum of 99'))).toBe(true);

      spy.mockRestore();
    });

    it('should detect unknown tags', () => {
      const service = require('../../../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([{
        tag: 'FF', // Unknown
        length: 1,
        value: 'A'
      }, {
        tag: '00',
        length: 2,
        value: '01'
      }, {
        tag: '63',
        length: 4,
        value: 'ABCD'
      }]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some(e => e.includes('Unknown tag'))).toBe(true);
      spy.mockRestore();
    });

    it('should validate Tip Indicator rules', () => {
      const base = '000201010212520412345802US5908Merchant6004City';
      const withTip = base + '550202';
      const tlv = withTip + '6304' + CRCService.calculateCRC16(withTip + '6304');

      const result = EMVTLVValidator.validate(tlv);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Tag 56 (Tip Amount) required'))).toBe(true);
    });

    it('should validate Tax Coherence (VAT)', () => {
      const service = require('../../../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        {
          tag: '81', length: 10, value: '', subtags: [
            { tag: '01', length: 2, value: '01' } // Condition 01 (Exempt)
          ]
        },
        {
          tag: '82', length: 10, value: '', subtags: [
            { tag: '01', length: 2, value: '10' } // Value 10 (Should be 0)
          ]
        },
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some(e => e.includes("must be '0' when condition is '01'"))).toBe(true);
      spy.mockRestore();
    });

    it('should validate invalid VAT condition value', () => {
      const service = require('../../../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        {
          tag: '81', length: 10, value: '', subtags: [
            { tag: '01', length: 2, value: '99' } // Invalid condition
          ]
        },
        {
          tag: '82', length: 10, value: '', subtags: [
            { tag: '01', length: 2, value: '0' }
          ]
        },
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some(e => e.includes("VAT condition must be '01', '02', or '03'"))).toBe(true);
      spy.mockRestore();
    });

    it('should validate invalid tip indicator value', () => {
      const service = require('../../../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        { tag: '55', length: 2, value: '99' }, // Invalid tip indicator
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some(e => e.includes("Tip Indicator) must be '01', '02', or '03'"))).toBe(true);
      spy.mockRestore();
    });

    it('should validate template without GUI subtag', () => {
      const service = require('../../../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        {
          tag: '26', length: 10, value: '', subtags: [
            { tag: '01', length: 2, value: 'XX' } // Missing subtag 00 (GUI)
          ]
        },
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some(e => e.includes('must have subtag 00 (GUI)'))).toBe(true);
      spy.mockRestore();
    });

    it('should validate tag value exceeds max length', () => {
      const service = require('../../../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        { tag: '59', length: 100, value: 'A'.repeat(100) }, // Exceeds max length
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some(e => e.includes('exceeds maximum'))).toBe(true);
      spy.mockRestore();
    });

    it('should validate subtag length exceeds maximum', () => {
      const service = require('../../../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        {
          tag: '26', length: 110, value: '', subtags: [
            { tag: '00', length: 100, value: 'A'.repeat(100) },
            { tag: '01', length: 5, value: 'XXXXX' }
          ]
        },
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some(e => e.includes('Subtag'))).toBe(true);
      spy.mockRestore();
    });

    it('should validate template without subtags', () => {
      const service = require('../../../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        { tag: '26', length: 0, value: '' }, // Template without subtags
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some(e => e.includes('Must be a template with subtags'))).toBe(true);
      spy.mockRestore();
    });

    it('should validate tip percentage required', () => {
      const service = require('../../../domain/emv/services/emv-tlv-service').EMVTLVService;
      const spy = jest.spyOn(service, 'parse').mockReturnValue([
        { tag: '00', length: 2, value: '01' },
        { tag: '55', length: 2, value: '03' }, // Tip indicator 03 requires tag 57
        { tag: '63', length: 4, value: 'ABCD' }
      ]);

      const result = EMVTLVValidator.validate('MOCKED');
      expect(result.errors.some(e => e.includes('Tag 57 (Tip Percentage) required'))).toBe(true);
      spy.mockRestore();
    });
  });
});
