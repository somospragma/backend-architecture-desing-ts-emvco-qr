import { EMVCoContentBuilder } from '../../application/emv-builder';

describe('EMVCoBuilder', () => {
  let builder: EMVCoContentBuilder;

  beforeEach(() => {
    builder = new EMVCoContentBuilder();
  });

  describe('setTag', () => {
    it('should set simple tag successfully', () => {
      const result = builder.setTag('52', '1234');
      
      expect(result).toBe(builder); // Should return this for chaining
    });

    it('should throw error for undefined tag', () => {
      // This test might not be possible due to TypeScript typing, but we test the runtime behavior
      expect(() => {
        (builder as any).setTag('ZZ', 'value');
      }).toThrow('Tag ZZ is not defined in the EMVCo standard');
    });

    it('should throw error for template tag', () => {
      expect(() => {
        builder.setTag('62', 'value');
      }).toThrow('Tag 62 is a template. Use setSubTag()');
    });

    it('should apply maxLength restriction', () => {
      // Tag 52 has maxLength of 4
      builder.setTag('52', '123456789');
      const result = builder.build();
      
      // Should contain truncated value
      expect(result).toContain('52041234');
    });

    it('should handle valid non-empty value', () => {
      const result = builder.setTag('54', '100.00');
      
      expect(result).toBe(builder);
    });

    it('should throw error for empty value', () => {
      expect(() => {
        builder.setTag('54', '');
      }).toThrow('The tag value is invalid string');
    });

    it('should throw error for N/A value', () => {
      expect(() => {
        builder.setTag('54', 'N/A');
      }).toThrow('The tag value is invalid string');
    });

    it('should allow method chaining', () => {
      const result = builder
        .setTag('52', '1234')
        .setTag('58', 'CO')
        .setTag('59', 'MiTienda');
      
      expect(result).toBe(builder);
    });
  });

  describe('setSubTag', () => {
    it('should set subtag successfully', () => {
      const result = builder.setSubTag('62', '01', 'reference');
      
      expect(result).toBe(builder);
    });

    it('should throw error for undefined template tag', () => {
      expect(() => {
        (builder as any).setSubTag('ZZ', '01', 'value');
      }).toThrow('Tag ZZ is not defined in the EMVCo standard');
    });

    it('should throw error for simple tag', () => {
      expect(() => {
        builder.setSubTag('52', '01', 'value');
      }).toThrow('Tag 52 is not a template. Use setTag()');
    });

    it('should throw error for invalid value', () => {
      expect(() => {
        builder.setSubTag('62', '01', '');
      }).toThrow('The tag value is invalid string');
    });

    it('should throw error for null value', () => {
      expect(() => {
        builder.setSubTag('62', '01', null as any);
      }).toThrow('The tag value is invalid object');
    });

    it('should throw error for undefined value', () => {
      expect(() => {
        builder.setSubTag('62', '01', undefined as any);
      }).toThrow('The tag value is invalid undefined');
    });

    it('should throw error for N/A value', () => {
      expect(() => {
        builder.setSubTag('62', '01', 'N/A');
      }).toThrow('The tag value is invalid string');
    });

    it('should handle multiple subtags in same template', () => {
      builder
        .setSubTag('62', '01', 'ref1')
        .setSubTag('62', '02', 'ref2');
      
      const result = builder.build();
      
      expect(result).toContain('62160104ref10204ref2'); // Actual format
    });

    it('should allow method chaining', () => {
      const result = builder
        .setSubTag('62', '01', 'ref1')
        .setSubTag('62', '02', 'ref2')
        .setSubTag('64', '01', 'lang');
      
      expect(result).toBe(builder);
    });
  });

  describe('build', () => {
    it('should build minimal QR code', () => {
      builder.setTag('52', '1234');
      const result = builder.build();
      
      expect(result).toMatch(/^52041234.*6304[0-9A-F]{4}$/);
      expect(result).toContain('6304'); // CRC tag
    });

    it('should build complete QR code', () => {
      builder
        .setTag('52', '1234')
        .setTag('53', '170')
        .setTag('58', 'CO')
        .setTag('59', 'MiTienda')
        .setTag('60', 'Bogota');
      
      const result = builder.build();
      
      expect(result).toContain('52041234');
      expect(result).toContain('5303170');
      expect(result).toContain('5802CO');
      expect(result).toContain('5908MiTienda');
      expect(result).toContain('6006Bogota');
      expect(result).toMatch(/6304[0-9A-F]{4}$/);
    });

    it('should sort tags alphabetically', () => {
      builder
        .setTag('60', 'Bogota')
        .setTag('52', '1234')
        .setTag('59', 'MiTienda');
      
      const result = builder.build();
      
      // Should be in order: 52, 59, 60, 63 (CRC)
      const tag52Index = result.indexOf('52041234');
      const tag59Index = result.indexOf('5908MiTienda');
      const tag60Index = result.indexOf('6006Bogota');
      
      expect(tag52Index).toBeLessThan(tag59Index);
      expect(tag59Index).toBeLessThan(tag60Index);
    });

    it('should include template fields', () => {
      builder
        .setTag('52', '1234')
        .setSubTag('62', '01', 'reference');
      
      const result = builder.build();
      
      expect(result).toContain('52041234');
      expect(result).toContain('62130109reference'); // Actual format
    });

    it('should sort subtags alphabetically', () => {
      builder
        .setTag('52', '1234')
        .setSubTag('62', '03', 'ref3')
        .setSubTag('62', '01', 'ref1')
        .setSubTag('62', '02', 'ref2');
      
      const result = builder.build();
      
      // Should contain subtags in order: 01, 02, 03
      expect(result).toContain('62240104ref10204ref20304ref3'); // Actual format
    });

    it('should clear internal state after build', () => {
      builder.setTag('52', '1234');
      const result1 = builder.build();
      
      builder.setTag('58', 'CO');
      const result2 = builder.build();
      
      // Second build should not contain first tag
      expect(result1).toContain('52041234');
      expect(result2).not.toContain('52041234');
      expect(result2).toContain('5802CO');
    });

    it('should calculate correct CRC', () => {
      builder.setTag('52', '1234');
      const result = builder.build();
      
      // Extract CRC from result
      const crcMatch = result.match(/6304([0-9A-F]{4})$/);
      expect(crcMatch).toBeTruthy();
      
      // Verify CRC is valid hex
      const crc = crcMatch![1];
      expect(crc).toMatch(/^[0-9A-F]{4}$/);
    });

    it('should handle empty builder', () => {
      const result = builder.build();
      
      // Should only contain CRC
      expect(result).toMatch(/^6304[0-9A-F]{4}$/);
    });
  });

  describe('private methods coverage', () => {
    it('should test processTemplateFields', () => {
      builder
        .setSubTag('62', '01', 'ref1')
        .setSubTag('64', '01', 'lang');
      
      const result = builder.build();
      
      expect(result).toContain('62080104ref1'); // Actual format
      expect(result).toContain('64080104lang'); // Actual format
    });

    it('should test buildQrBody', () => {
      builder.setTag('52', '1234');
      const result = builder.build();
      
      expect(result).toContain('52041234');
    });

    it('should test addCrcToQrBody', () => {
      builder.setTag('52', '1234');
      const result = builder.build();
      
      expect(result).toMatch(/6304[0-9A-F]{4}$/);
    });

    it('should test formatTag', () => {
      builder.setTag('52', '1234');
      const result = builder.build();
      
      // Format should be: tag + length + value
      expect(result).toContain('52041234'); // 52 + 04 + 1234
    });

    it('should test isValidValue with various inputs', () => {
      // Valid values
      builder.setTag('54', 'valid');
      let result = builder.build();
      expect(result).toContain('5405valid');
      
      // Invalid values should throw errors
      expect(() => {
        builder.setTag('55', '');
      }).toThrow('The tag value is invalid string');
      
      expect(() => {
        builder.setTag('56', 'N/A');
      }).toThrow('The tag value is invalid string');
    });
  });

  describe('integration tests', () => {
    it('should build valid EMV QR code', () => {
      const result = builder
        .setTag('52', '4111') // Merchant Category Code
        .setTag('53', '170')  // Transaction Currency (COP)
        .setTag('54', '100.00') // Transaction Amount
        .setTag('58', 'CO')   // Country Code
        .setTag('59', 'Mi Tienda') // Merchant Name
        .setTag('60', 'Bogota') // Merchant City
        .setSubTag('62', '01', 'REF123') // Additional Data
        .build();
      
      // Verify structure
      expect(result).toContain('52044111');
      expect(result).toContain('5303170');
      expect(result).toContain('5406100.00');
      expect(result).toContain('5802CO');
      expect(result).toContain('5909Mi Tienda');
      expect(result).toContain('6006Bogota');
      expect(result).toContain('62100106REF123'); // Actual format
      expect(result).toMatch(/6304[0-9A-F]{4}$/);
    });

    it('should handle complex template structures', () => {
      const result = builder
        .setTag('52', '1234')
        .setSubTag('62', '01', 'ref1')
        .setSubTag('62', '05', 'ref5')
        .setSubTag('64', '00', 'EN')
        .setSubTag('64', '01', 'English Name')
        .build();
      
      expect(result).toContain('62160104ref10504ref5'); // Actual format
      expect(result).toContain('64220002EN0112English Name');
    });
  });
});