import { EMVTagValue } from '../../../domain/emv/value-objects/emv-tag';

describe('EMVTagValue', () => {
  describe('constructor', () => {
    it('should create EMVTagValue with all properties', () => {
      const tag = new EMVTagValue('00', 'simple', 'Test Description', true, 10);
      
      expect(tag.tag).toBe('00');
      expect(tag.type).toBe('simple');
      expect(tag.description).toBe('Test Description');
      expect(tag.required).toBe(true);
      expect(tag.maxLength).toBe(10);
    });

    it('should create EMVTagValue without maxLength', () => {
      const tag = new EMVTagValue('01', 'template', 'Test Template', false);
      
      expect(tag.tag).toBe('01');
      expect(tag.type).toBe('template');
      expect(tag.description).toBe('Test Template');
      expect(tag.required).toBe(false);
      expect(tag.maxLength).toBeUndefined();
    });
  });

  describe('createSimple', () => {
    it('should create simple tag with maxLength', () => {
      const tag = EMVTagValue.createSimple('52', 'Merchant Category Code', true, 4);
      
      expect(tag.tag).toBe('52');
      expect(tag.type).toBe('simple');
      expect(tag.description).toBe('Merchant Category Code');
      expect(tag.required).toBe(true);
      expect(tag.maxLength).toBe(4);
    });

    it('should create simple tag without maxLength', () => {
      const tag = EMVTagValue.createSimple('54', 'Transaction Amount', false);
      
      expect(tag.tag).toBe('54');
      expect(tag.type).toBe('simple');
      expect(tag.description).toBe('Transaction Amount');
      expect(tag.required).toBe(false);
      expect(tag.maxLength).toBeUndefined();
    });
  });

  describe('createTemplate', () => {
    it('should create template tag', () => {
      const tag = EMVTagValue.createTemplate('62', 'Additional Data Field Template', false);
      
      expect(tag.tag).toBe('62');
      expect(tag.type).toBe('template');
      expect(tag.description).toBe('Additional Data Field Template');
      expect(tag.required).toBe(false);
      expect(tag.maxLength).toBeUndefined();
    });

    it('should create required template tag', () => {
      const tag = EMVTagValue.createTemplate('80', 'Channel', true);
      
      expect(tag.tag).toBe('80');
      expect(tag.type).toBe('template');
      expect(tag.description).toBe('Channel');
      expect(tag.required).toBe(true);
      expect(tag.maxLength).toBeUndefined();
    });
  });
});