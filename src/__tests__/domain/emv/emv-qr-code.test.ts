import { EMVQRCodeContent } from '../../../domain/emv/entities/emv-qr-code';

describe('EMVQRCode', () => {
  let qrCode: EMVQRCodeContent;

  beforeEach(() => {
    qrCode = new EMVQRCodeContent();
  });

  describe('setField and getField', () => {
    it('should set and get field value', () => {
      qrCode.setField('00', '01');
      
      expect(qrCode.getField('00')).toBe('01');
    });

    it('should return undefined for non-existent field', () => {
      expect(qrCode.getField('99')).toBeUndefined();
    });

    it('should overwrite existing field', () => {
      qrCode.setField('00', '01');
      qrCode.setField('00', '02');
      
      expect(qrCode.getField('00')).toBe('02');
    });
  });

  describe('setSubField and getSubField', () => {
    it('should set and get subfield value', () => {
      qrCode.setSubField('62', '01', 'reference');
      
      expect(qrCode.getSubField('62', '01')).toBe('reference');
    });

    it('should return undefined for non-existent template', () => {
      expect(qrCode.getSubField('62', '01')).toBeUndefined();
    });

    it('should return undefined for non-existent subfield', () => {
      qrCode.setSubField('62', '01', 'reference');
      
      expect(qrCode.getSubField('62', '02')).toBeUndefined();
    });

    it('should handle multiple subfields in same template', () => {
      qrCode.setSubField('62', '01', 'reference1');
      qrCode.setSubField('62', '02', 'reference2');
      
      expect(qrCode.getSubField('62', '01')).toBe('reference1');
      expect(qrCode.getSubField('62', '02')).toBe('reference2');
    });

    it('should overwrite existing subfield', () => {
      qrCode.setSubField('62', '01', 'reference1');
      qrCode.setSubField('62', '01', 'reference2');
      
      expect(qrCode.getSubField('62', '01')).toBe('reference2');
    });
  });

  describe('getAllFields', () => {
    it('should return empty map when no fields set', () => {
      const fields = qrCode.getAllFields();
      
      expect(fields.size).toBe(0);
    });

    it('should return all fields', () => {
      qrCode.setField('00', '01');
      qrCode.setField('52', '1234');
      
      const fields = qrCode.getAllFields();
      
      expect(fields.size).toBe(2);
      expect(fields.get('00')).toBe('01');
      expect(fields.get('52')).toBe('1234');
    });

    it('should return a copy of fields map', () => {
      qrCode.setField('00', '01');
      
      const fields = qrCode.getAllFields();
      fields.set('52', '1234');
      
      expect(qrCode.getField('52')).toBeUndefined();
    });
  });

  describe('getAllTemplates', () => {
    it('should return empty map when no templates set', () => {
      const templates = qrCode.getAllTemplates();
      
      expect(templates.size).toBe(0);
    });

    it('should return all templates', () => {
      qrCode.setSubField('62', '01', 'ref1');
      qrCode.setSubField('64', '01', 'ref2');
      
      const templates = qrCode.getAllTemplates();
      
      expect(templates.size).toBe(2);
      expect(templates.get('62')?.get('01')).toBe('ref1');
      expect(templates.get('64')?.get('01')).toBe('ref2');
    });

    it('should return a copy of templates map', () => {
      qrCode.setSubField('62', '01', 'ref1');
      
      const templates = qrCode.getAllTemplates();
      templates.set('64', new Map([['01', 'ref2']]));
      
      expect(qrCode.getSubField('64', '01')).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all fields and templates', () => {
      qrCode.setField('00', '01');
      qrCode.setSubField('62', '01', 'ref1');
      
      qrCode.clear();
      
      expect(qrCode.getAllFields().size).toBe(0);
      expect(qrCode.getAllTemplates().size).toBe(0);
      expect(qrCode.getField('00')).toBeUndefined();
      expect(qrCode.getSubField('62', '01')).toBeUndefined();
    });

    it('should work on empty qr code', () => {
      expect(() => qrCode.clear()).not.toThrow();
      
      expect(qrCode.getAllFields().size).toBe(0);
      expect(qrCode.getAllTemplates().size).toBe(0);
    });
  });
});