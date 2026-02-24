import { EMVField, EMV_FIELD_MAP, TypeCondition } from '../../../domain/emv/entities/emv-field';

describe('EMVField', () => {
  describe('EMVField enum', () => {
    it('should have all core fields', () => {
      expect(EMVField.PAYLOAD_FORMAT_INDICATOR).toBe('payloadFormatIndicator');
      expect(EMVField.POINT_OF_INITIATION_METHOD).toBe('pointOfInitiationMethod');
    });

    it('should have merchant account fields', () => {
      expect(EMVField.MERCHANT_ACCOUNT_GUI).toBe('globallyUniqueIdentifier');
      expect(EMVField.MERCHANT_ACCOUNT_ID).toBe('merchantAccountId');
      expect(EMVField.MERCHANT_ACCOUNT_MOBILE).toBe('merchantAccountMobile');
      expect(EMVField.MERCHANT_ACCOUNT_EMAIL).toBe('merchantAccountEmail');
      expect(EMVField.MERCHANT_ACCOUNT_ALPHANUMERIC).toBe('merchantAccountAlphanumeric');
      expect(EMVField.MERCHANT_ACCOUNT_MERCHANT_ID).toBe('merchantAccountMerchantId');
    });

    it('should have network fields', () => {
      expect(EMVField.NETWORK_GUI).toBe('networkGui');
      expect(EMVField.NETWORK_ID).toBe('networkId');
    });

    it('should have merchant code fields', () => {
      expect(EMVField.MERCHANT_CODE_GUI).toBe('merchantCodeGui');
      expect(EMVField.MERCHANT_CODE).toBe('merchantCode');
    });

    it('should have aggregator code fields', () => {
      expect(EMVField.AGGREGATOR_CODE_GUI).toBe('aggregatorCodeGui');
      expect(EMVField.AGGREGATOR_CODE).toBe('aggregatorCode');
    });

    it('should have merchant data fields', () => {
      expect(EMVField.MERCHANT_CATEGORY_CODE).toBe('merchantCategoryCode');
      expect(EMVField.TRANSACTION_CURRENCY).toBe('transactionCurrency');
      expect(EMVField.TRANSACTION_AMOUNT).toBe('transactionAmount');
      expect(EMVField.TIP_INDICATOR).toBe('tipIndicator');
      expect(EMVField.TIP_FIXED_AMOUNT).toBe('tipFixedAmount');
      expect(EMVField.TIP_PERCENTAGE).toBe('tipPercentage');
      expect(EMVField.COUNTRY_CODE).toBe('countryCode');
      expect(EMVField.MERCHANT_NAME).toBe('merchantName');
      expect(EMVField.MERCHANT_CITY).toBe('merchantCity');
      expect(EMVField.POSTAL_CODE).toBe('postalCode');
    });

    it('should have additional data fields', () => {
      expect(EMVField.ADDITIONAL_BILL_NUMBER).toBe('additionalBillNumber');
      expect(EMVField.ADDITIONAL_MOBILE_NUMBER).toBe('additionalMobileNumber');
      expect(EMVField.ADDITIONAL_STORE_LABEL).toBe('additionalStoreLabel');
      expect(EMVField.ADDITIONAL_LOYALTY_NUMBER).toBe('additionalLoyaltyNumber');
      expect(EMVField.ADDITIONAL_REFERENCE_LABEL).toBe('additionalReferenceLabel');
      expect(EMVField.ADDITIONAL_CUSTOMER_LABEL).toBe('additionalCustomerLabel');
      expect(EMVField.ADDITIONAL_TERMINAL_LABEL).toBe('additionalTerminalLabel');
      expect(EMVField.ADDITIONAL_PURPOSE).toBe('additionalPurpose');
      expect(EMVField.ADDITIONAL_CONSUMER_DATA).toBe('additionalConsumerData');
      expect(EMVField.ADDITIONAL_MERCHANT_TAX_ID).toBe('additionalMerchantTaxId');
      expect(EMVField.ADDITIONAL_CHANNEL_ORIGIN).toBe('additionalChannelOrigin');
    });

    it('should have language fields', () => {
      expect(EMVField.LANGUAGE_PREFERENCE).toBe('languagePreference');
      expect(EMVField.MERCHANT_NAME_ALT).toBe('merchantNameAlt');
      expect(EMVField.MERCHANT_CITY_ALT).toBe('merchantCityAlt');
    });

    it('should have channel and tax fields', () => {
      expect(EMVField.CHANNEL_GUI).toBe('channelGui');
      expect(EMVField.CHANNEL).toBe('channel');
      expect(EMVField.VAT_CONDITION_GUI).toBe('vatConditionGui');
      expect(EMVField.VAT_CONDITION).toBe('vatCondition');
      expect(EMVField.VAT_VALUE_GUI).toBe('vatValueGui');
      expect(EMVField.VAT_VALUE).toBe('vatValue');
      expect(EMVField.VAT_BASE_GUI).toBe('vatBaseGui');
      expect(EMVField.VAT_BASE).toBe('vatBase');
      expect(EMVField.INC_CONDITION_GUI).toBe('incConditionGui');
      expect(EMVField.INC_CONDITION).toBe('incCondition');
      expect(EMVField.INC_VALUE_GUI).toBe('incValueGui');
      expect(EMVField.INC_VALUE).toBe('incValue');
    });

    it('should have transaction and security fields', () => {
      expect(EMVField.TRANSACTION_ID_GUI).toBe('transactionIdGui');
      expect(EMVField.TRANSACTION_ID).toBe('transactionId');
      expect(EMVField.SECURITY_HASH_GUI).toBe('securityHashGui');
      expect(EMVField.SECURITY_HASH).toBe('securityHash');
    });

    it('should have other operations fields', () => {
      expect(EMVField.SERVICE_CODE).toBe('serviceCode');
      expect(EMVField.REFERENCE_OR_MOBILE_GUI).toBe('referenceOrMobileGui');
      expect(EMVField.REFERENCE_OR_MOBILE).toBe('referenceOrMobile');
      expect(EMVField.PRODUCT_TYPE_RECAUDO).toBe('productTypeRecaudo');
      expect(EMVField.ORIGIN_ACCOUNT).toBe('originAccount');
      expect(EMVField.DESTINATION_ACCOUNT).toBe('destinationAccount');
      expect(EMVField.DESTINATION_ACCOUNT_REF).toBe('destinationAccountRef');
      expect(EMVField.PRODUCT_TYPE_TRANSFER).toBe('productTypeTransfer');
      expect(EMVField.DISCOUNT_APPLICATION_GUI).toBe('discountApplicationGui');
      expect(EMVField.DISCOUNT_APPLICATION).toBe('discountApplication');
    });
  });

  describe('TypeCondition enum', () => {
    it('should have all condition values', () => {
      expect(TypeCondition._01).toBe('01');
      expect(TypeCondition._02).toBe('02');
      expect(TypeCondition._03).toBe('03');
    });
  });

  describe('EMV_FIELD_MAP', () => {
    it('should map core fields to tags', () => {
      expect(EMV_FIELD_MAP[EMVField.PAYLOAD_FORMAT_INDICATOR]).toEqual({ tag: '00' });
      expect(EMV_FIELD_MAP[EMVField.POINT_OF_INITIATION_METHOD]).toEqual({ tag: '01' });
    });

    it('should map merchant account fields to tags with subtags', () => {
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_ACCOUNT_GUI]).toEqual({ tag: '26', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_ACCOUNT_ID]).toEqual({ tag: '26', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_ACCOUNT_MOBILE]).toEqual({ tag: '26', subTag: '02' });
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_ACCOUNT_EMAIL]).toEqual({ tag: '26', subTag: '03' });
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_ACCOUNT_ALPHANUMERIC]).toEqual({ tag: '26', subTag: '04' });
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_ACCOUNT_MERCHANT_ID]).toEqual({ tag: '26', subTag: '05' });
    });

    it('should map network fields to tags with subtags', () => {
      expect(EMV_FIELD_MAP[EMVField.NETWORK_GUI]).toEqual({ tag: '49', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.NETWORK_ID]).toEqual({ tag: '49', subTag: '01' });
    });

    it('should map merchant code fields to tags with subtags', () => {
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_CODE_GUI]).toEqual({ tag: '50', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_CODE]).toEqual({ tag: '50', subTag: '01' });
    });

    it('should map aggregator code fields to tags with subtags', () => {
      expect(EMV_FIELD_MAP[EMVField.AGGREGATOR_CODE_GUI]).toEqual({ tag: '51', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.AGGREGATOR_CODE]).toEqual({ tag: '51', subTag: '01' });
    });

    it('should map merchant data fields to tags', () => {
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_CATEGORY_CODE]).toEqual({ tag: '52' });
      expect(EMV_FIELD_MAP[EMVField.TRANSACTION_CURRENCY]).toEqual({ tag: '53' });
      expect(EMV_FIELD_MAP[EMVField.TRANSACTION_AMOUNT]).toEqual({ tag: '54' });
      expect(EMV_FIELD_MAP[EMVField.TIP_INDICATOR]).toEqual({ tag: '55' });
      expect(EMV_FIELD_MAP[EMVField.TIP_FIXED_AMOUNT]).toEqual({ tag: '56' });
      expect(EMV_FIELD_MAP[EMVField.TIP_PERCENTAGE]).toEqual({ tag: '57' });
      expect(EMV_FIELD_MAP[EMVField.COUNTRY_CODE]).toEqual({ tag: '58' });
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_NAME]).toEqual({ tag: '59' });
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_CITY]).toEqual({ tag: '60' });
      expect(EMV_FIELD_MAP[EMVField.POSTAL_CODE]).toEqual({ tag: '61' });
    });

    it('should map additional data fields to tags with subtags', () => {
      expect(EMV_FIELD_MAP[EMVField.ADDITIONAL_BILL_NUMBER]).toEqual({ tag: '62', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.ADDITIONAL_MOBILE_NUMBER]).toEqual({ tag: '62', subTag: '02' });
      expect(EMV_FIELD_MAP[EMVField.ADDITIONAL_STORE_LABEL]).toEqual({ tag: '62', subTag: '03' });
      expect(EMV_FIELD_MAP[EMVField.ADDITIONAL_LOYALTY_NUMBER]).toEqual({ tag: '62', subTag: '04' });
      expect(EMV_FIELD_MAP[EMVField.ADDITIONAL_REFERENCE_LABEL]).toEqual({ tag: '62', subTag: '05' });
      expect(EMV_FIELD_MAP[EMVField.ADDITIONAL_CUSTOMER_LABEL]).toEqual({ tag: '62', subTag: '06' });
      expect(EMV_FIELD_MAP[EMVField.ADDITIONAL_TERMINAL_LABEL]).toEqual({ tag: '62', subTag: '07' });
      expect(EMV_FIELD_MAP[EMVField.ADDITIONAL_PURPOSE]).toEqual({ tag: '62', subTag: '08' });
      expect(EMV_FIELD_MAP[EMVField.ADDITIONAL_CONSUMER_DATA]).toEqual({ tag: '62', subTag: '09' });
      expect(EMV_FIELD_MAP[EMVField.ADDITIONAL_MERCHANT_TAX_ID]).toEqual({ tag: '62', subTag: '10' });
      expect(EMV_FIELD_MAP[EMVField.ADDITIONAL_CHANNEL_ORIGIN]).toEqual({ tag: '62', subTag: '11' });
    });

    it('should map language fields to tags with subtags', () => {
      expect(EMV_FIELD_MAP[EMVField.LANGUAGE_PREFERENCE]).toEqual({ tag: '64', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_NAME_ALT]).toEqual({ tag: '64', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.MERCHANT_CITY_ALT]).toEqual({ tag: '64', subTag: '02' });
    });

    it('should map channel and tax fields to tags with subtags', () => {
      expect(EMV_FIELD_MAP[EMVField.CHANNEL_GUI]).toEqual({ tag: '80', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.CHANNEL]).toEqual({ tag: '80', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.VAT_CONDITION_GUI]).toEqual({ tag: '81', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.VAT_CONDITION]).toEqual({ tag: '81', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.VAT_VALUE_GUI]).toEqual({ tag: '82', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.VAT_VALUE]).toEqual({ tag: '82', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.VAT_BASE_GUI]).toEqual({ tag: '83', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.VAT_BASE]).toEqual({ tag: '83', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.INC_CONDITION_GUI]).toEqual({ tag: '84', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.INC_CONDITION]).toEqual({ tag: '84', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.INC_VALUE_GUI]).toEqual({ tag: '85', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.INC_VALUE]).toEqual({ tag: '85', subTag: '01' });
    });

    it('should map transaction and security fields to tags with subtags', () => {
      expect(EMV_FIELD_MAP[EMVField.TRANSACTION_ID_GUI]).toEqual({ tag: '90', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.TRANSACTION_ID]).toEqual({ tag: '90', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.SECURITY_HASH_GUI]).toEqual({ tag: '91', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.SECURITY_HASH]).toEqual({ tag: '91', subTag: '01' });
    });

    it('should map other operations fields to tags with subtags', () => {
      expect(EMV_FIELD_MAP[EMVField.SERVICE_CODE]).toEqual({ tag: '92', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.REFERENCE_OR_MOBILE_GUI]).toEqual({ tag: '93', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.REFERENCE_OR_MOBILE]).toEqual({ tag: '93', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.PRODUCT_TYPE_RECAUDO]).toEqual({ tag: '94', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.ORIGIN_ACCOUNT]).toEqual({ tag: '95', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.DESTINATION_ACCOUNT]).toEqual({ tag: '96', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.DESTINATION_ACCOUNT_REF]).toEqual({ tag: '97', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.PRODUCT_TYPE_TRANSFER]).toEqual({ tag: '98', subTag: '01' });
      expect(EMV_FIELD_MAP[EMVField.DISCOUNT_APPLICATION_GUI]).toEqual({ tag: '99', subTag: '00' });
      expect(EMV_FIELD_MAP[EMVField.DISCOUNT_APPLICATION]).toEqual({ tag: '99', subTag: '01' });
    });
  });
});
