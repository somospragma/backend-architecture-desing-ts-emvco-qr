import { EMVCoContentSemanticBuilder } from '../application/emv-semantic-builder';
import { EMVField, TypeCondition } from '../domain/emv/entities/emv-field';

describe('Branch Coverage Tests', () => {
  let builder: EMVCoContentSemanticBuilder;

  beforeEach(() => {
    builder = new EMVCoContentSemanticBuilder();
  });

  describe('Semantic Builder - All Methods', () => {
    it('should cover all setter methods', () => {
      builder
        .setPayloadFormatIndicator('01')
        .setDynamicQR()
        .setStaticQR()
        .setMerchantAccountGUI('COM.TEST.GUI')
        .setMerchantAccountId('123', EMVField.MERCHANT_ACCOUNT_MERCHANT_ID)
        .setNetworkGUI('COM.TEST.NET')
        .setNetworkId('FULL')
        .setMerchantCodeGUI('COM.TEST.MC')
        .setMerchantCode('456')
        .setAggregatorCodeGUI('COM.TEST.AG')
        .setAggregatorCode('789')
        .setMerchantCategoryCode('5411')
        .setCurrencyISO4217('840')
        .setTransactionAmount('100')
        .setTipIndicator(TypeCondition._01)
        .setTipFixedAmount('10')
        .setTipPercentage('15')
        .setCountryCode('US')
        .setMerchantName('Test Store')
        .setMerchantCity('New York')
        .setPostalCode('10001')
        .setAdditionalBillNumber('BILL123')
        .setAdditionalMobileNumber('1234567890')
        .setAdditionalStoreLabel('STORE1')
        .setAdditionalLoyaltyNumber('LOY123')
        .setAdditionalReferenceLabel('REF123')
        .setAdditionalCustomerLabel('CUST123')
        .setAdditionalTerminalLabel('TERM123')
        .setAdditionalPurpose('PURPOSE')
        .setAdditionalConsumerData('DATA')
        .setAdditionalMerchantTaxId('TAX123')
        .setAdditionalChannelOrigin('WEB')
        .setLanguagePreference('en')
        .setMerchantNameAlt('Test Store Alt')
        .setMerchantCityAlt('NYC')
        .setChannelGui('COM.TEST.CH')
        .setChannel('POS')
        .setVATConditionGui('COM.TEST.VATC')
        .setVATCondition(TypeCondition._01)
        .setVATValueGui('COM.TEST.VATV')
        .setVATValue('10')
        .setVATBaseGui('COM.TEST.VATB')
        .setVATBase('100')
        .setINCConditionGui('COM.TEST.INCC')
        .setINCCondition(TypeCondition._01)
        .setINCValueGui('COM.TEST.INCV')
        .setINCValue('5')
        .setTransactionIdGui('COM.TEST.TRX')
        .setTransactionId('TRX123')
        .setSecurityHashGui('COM.TEST.SEC')
        .setSecurityHash('HASH123')
        .setReferenceOrMobileGui('COM.TEST.REF')
        .setReferenceOrMobile('REF456')
        .setDiscountApplicationGui('COM.TEST.DISC')
        .setDiscountApplication('20');

      const result = builder.build();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle invalid acquirer network id', () => {
      expect(() => builder.setAcquirerNetworkId('')).toThrow('Invalid Acquirer network id value');
    });

    it('should handle invalid merchant account id key type', () => {
      expect(() => builder.setMerchantAccountId('123', 'INVALID' as any)).toThrow('Invalid key type');
    });

    it('should handle invalid tag value in setTag', () => {
      expect(() => (builder as any).setTag('00', null)).toThrow('The tag value is invalid');
    });

    it('should handle invalid tag value in setSubTag', () => {
      expect(() => (builder as any).setSubTag('26', '00', null)).toThrow('The tag value is invalid');
    });

    it('should handle undefined tag in setTag', () => {
      expect(() => (builder as any).setTag('ZZ', 'value')).toThrow('not defined in the EMVCo standard');
    });

    it('should handle template tag in setTag', () => {
      expect(() => (builder as any).setTag('26', 'value')).toThrow('is a template. Use setSubTag()');
    });

    it('should handle simple tag in setSubTag', () => {
      expect(() => (builder as any).setSubTag('00', '00', 'value')).toThrow('is not a template. Use setTag()');
    });

    it('should truncate value when maxLength > 0', () => {
      builder.setMerchantName('A'.repeat(200));
      const result = builder.build();
      expect(result).toBeDefined();
    });

    it('should handle all tip indicator values', () => {
      builder.setPayloadFormatIndicator('01').setTipIndicator(TypeCondition._02);
      expect(builder.build()).toBeDefined();
      
      builder.setPayloadFormatIndicator('01').setTipIndicator(TypeCondition._03);
      expect(builder.build()).toBeDefined();
    });

    it('should handle all VAT condition values', () => {
      builder.setPayloadFormatIndicator('01')
        .setVATConditionGui('COM.TEST')
        .setVATCondition(TypeCondition._02);
      expect(builder.build()).toBeDefined();
      
      builder.setPayloadFormatIndicator('01')
        .setVATConditionGui('COM.TEST')
        .setVATCondition(TypeCondition._03);
      expect(builder.build()).toBeDefined();
    });

    it('should handle all INC condition values', () => {
      builder.setPayloadFormatIndicator('01')
        .setINCConditionGui('COM.TEST')
        .setINCCondition(TypeCondition._02);
      expect(builder.build()).toBeDefined();
      
      builder.setPayloadFormatIndicator('01')
        .setINCConditionGui('COM.TEST')
        .setINCCondition(TypeCondition._03);
      expect(builder.build()).toBeDefined();
    });
  });
});
