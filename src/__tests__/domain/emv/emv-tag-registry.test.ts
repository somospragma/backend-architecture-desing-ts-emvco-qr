import { EMVTagRegistry } from '../../../domain/emv/services/emv-tag-registry';

describe('EMVTagRegistry', () => {
  describe('getTag', () => {
    it('should return tag info for valid EMV tag', () => {
      const tagInfo = EMVTagRegistry.getTag('00');
      
      expect(tagInfo).toBeDefined();
      expect(tagInfo?.tag).toBe('00');
      expect(tagInfo?.description).toBe('Payload Format Indicator');
      expect(tagInfo?.type).toBe('simple');
      expect(tagInfo?.required).toBe(true);
      expect(tagInfo?.maxLength).toBe(2);
    });

    it('should return tag info for template tag', () => {
      const tagInfo = EMVTagRegistry.getTag('62');
      
      expect(tagInfo).toBeDefined();
      expect(tagInfo?.tag).toBe('62');
      expect(tagInfo?.description).toBe('Additional Data Field Template');
      expect(tagInfo?.type).toBe('template');
      expect(tagInfo?.required).toBe(false);
      expect(tagInfo?.maxLength).toBeUndefined();
    });

    it('should return tag info for merchant account information', () => {
      const tagInfo = EMVTagRegistry.getTag('26');
      
      expect(tagInfo).toBeDefined();
      expect(tagInfo?.tag).toBe('26');
      expect(tagInfo?.description).toBe('Merchant Account Information');
      expect(tagInfo?.type).toBe('template');
      expect(tagInfo?.required).toBe(false);
    });

    it('should return tag info for proprietary tags', () => {
      const tagInfo = EMVTagRegistry.getTag('80');
      
      expect(tagInfo).toBeDefined();
      expect(tagInfo?.tag).toBe('80');
      expect(tagInfo?.description).toBe('Channel');
      expect(tagInfo?.type).toBe('template');
      expect(tagInfo?.required).toBe(true);
    });

    it('should return tag info for all core EMV tags', () => {
      const coreTags = ['52', '53', '58', '59', '60', '63'];
      
      coreTags.forEach(tag => {
        const tagInfo = EMVTagRegistry.getTag(tag as any);
        expect(tagInfo).toBeDefined();
        expect(tagInfo?.tag).toBe(tag);
      });
    });
  });

  describe('getAllTags', () => {
    it('should return all tags', () => {
      const allTags = EMVTagRegistry.getAllTags();
      
      expect(Object.keys(allTags)).toHaveLength(100); // 00-99
      expect(allTags['00']).toBeDefined();
      expect(allTags['99']).toBeDefined();
    });

    it('should return tags with correct structure', () => {
      const allTags = EMVTagRegistry.getAllTags();
      
      Object.values(allTags).forEach(tagInfo => {
        expect(tagInfo.tag).toBeDefined();
        expect(tagInfo.type).toMatch(/^(simple|template)$/);
        expect(tagInfo.description).toBeDefined();
        expect(typeof tagInfo.required).toBe('boolean');
      });
    });
  });

  describe('isValidTag', () => {
    it('should return true for valid EMV tags', () => {
      expect(EMVTagRegistry.isValidTag('00')).toBe(true);
      expect(EMVTagRegistry.isValidTag('52')).toBe(true);
      expect(EMVTagRegistry.isValidTag('62')).toBe(true);
      expect(EMVTagRegistry.isValidTag('99')).toBe(true);
    });

    it('should return false for invalid tags', () => {
      expect(EMVTagRegistry.isValidTag('100')).toBe(false);
      expect(EMVTagRegistry.isValidTag('AA')).toBe(false);
      expect(EMVTagRegistry.isValidTag('')).toBe(false);
      expect(EMVTagRegistry.isValidTag('1')).toBe(false);
      expect(EMVTagRegistry.isValidTag('ABC')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(EMVTagRegistry.isValidTag('0')).toBe(false);
      expect(EMVTagRegistry.isValidTag('000')).toBe(false);
      expect(EMVTagRegistry.isValidTag(' 00')).toBe(false);
      expect(EMVTagRegistry.isValidTag('00 ')).toBe(false);
    });
  });

  describe('tag coverage', () => {
    it('should have all tags from 00 to 99', () => {
      for (let i = 0; i <= 99; i++) {
        const tag = i.toString().padStart(2, '0');
        expect(EMVTagRegistry.isValidTag(tag)).toBe(true);
      }
    });

    it('should have correct tag types for known ranges', () => {
      // Core tags should be simple
      expect(EMVTagRegistry.getTag('00')?.type).toBe('simple');
      expect(EMVTagRegistry.getTag('01')?.type).toBe('simple');
      
      // Merchant account info should be template
      expect(EMVTagRegistry.getTag('26')?.type).toBe('template');
      expect(EMVTagRegistry.getTag('51')?.type).toBe('template');
      
      // Core data objects
      expect(EMVTagRegistry.getTag('52')?.type).toBe('simple');
      expect(EMVTagRegistry.getTag('59')?.type).toBe('simple');
      
      // Templates
      expect(EMVTagRegistry.getTag('62')?.type).toBe('template');
      expect(EMVTagRegistry.getTag('64')?.type).toBe('template');
    });
  });
});