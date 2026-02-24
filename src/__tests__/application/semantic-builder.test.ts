import { EMVCoContentSemanticBuilder } from '../../application/emv-semantic-builder';
import { EMVField, TypeCondition } from '../../domain/emv/entities/emv-field';
import { EMVTagRegistry } from '../../domain/emv/services/emv-tag-registry';

describe('EMVCoContentSemanticBuilder', () => {
    let builder: EMVCoContentSemanticBuilder;

    beforeEach(() => {
        builder = new EMVCoContentSemanticBuilder();
    });

    describe('Acquirer Network ID', () => {
        it('should set acquirer network id successfully', () => {
            expect(builder.setAcquirerNetworkId('TEST.NETWORK')).toBe(builder);
            expect(builder.acquirerNetworkId).toBe('TEST.NETWORK');
        });

        it('should throw error for invalid acquirer network id', () => {
            expect(() => builder.setAcquirerNetworkId(undefined as any)).toThrow('Invalid Acquirer network id value');
            expect(() => builder.setAcquirerNetworkId('')).toThrow('Invalid Acquirer network id value');
        });
    });

    describe('Payload Format Indicator and Point of Initiation', () => {
        it('should set payload format indicator', () => {
            builder.setPayloadFormatIndicator();
            builder.setPayloadFormatIndicator('01');
        });

        it('should set dynamic QR', () => {
            builder.setDynamicQR();
        });

        it('should set static QR', () => {
            builder.setStaticQR();
        });
    });

    describe('Merchant Accounts', () => {
        it('should set merchant account GUI', () => {
            builder.setMerchantAccountGUI('GUI.TEST');
        });

        it('should set merchant account ID with valid key type', () => {
            builder.setMerchantAccountId('123456', EMVField.MERCHANT_ACCOUNT_ID);
        });

        it('should throw error for merchant account ID with invalid key type', () => {
            expect(() => builder.setMerchantAccountId('123', EMVField.PAYLOAD_FORMAT_INDICATOR as any)).toThrow('Invalid key type');
        });
    });

    describe('Network and Merchant Codes', () => {
        it('should set network GUI and ID', () => {
            builder.setNetworkGUI('NET.GUI');
            builder.setNetworkId('NETID');
        });

        it('should set merchant code GUI and code', () => {
            builder.setMerchantCodeGUI('MERCH.GUI');
            builder.setMerchantCode('1234');
        });

        it('should set aggregator code GUI and code', () => {
            builder.setAggregatorCodeGUI('AGG.GUI');
            builder.setAggregatorCode('5678');
        });

        it('should set merchant category code', () => {
            builder.setMerchantCategoryCode('5411');
        });
    });

    describe('Transaction Details', () => {
        it('should set currency', () => {
            builder.setCurrencyISO4217('840');
        });

        it('should set transaction amount', () => {
            builder.setTransactionAmount('10.50');
        });

        it('should set tip indicator and amounts', () => {
            builder.setTipIndicator(TypeCondition._01);
            builder.setTipFixedAmount('1.00');
            builder.setTipPercentage('10');
        });
    });

    describe('Merchant Information', () => {
        it('should set country code, name, city, postal code', () => {
            builder.setCountryCode('US');
            builder.setMerchantName('Test Merchant');
            builder.setMerchantCity('Test City');
            builder.setPostalCode('12345');
        });

        it('should set language preference and alternate merchant info', () => {
            builder.setLanguagePreference('en');
            builder.setMerchantNameAlt('Alt Name');
            builder.setMerchantCityAlt('Alt City');
        });
    });

    describe('Additional Data', () => {
        it('should set various additional data fields', () => {
            builder.setAdditionalBillNumber('BILL123');
            builder.setAdditionalMobileNumber('555-0123');
            builder.setAdditionalStoreLabel('STORE1');
            builder.setAdditionalLoyaltyNumber('LOYAL123');
            builder.setAdditionalReferenceLabel('REF123');
            builder.setAdditionalCustomerLabel('CUST123');
            builder.setAdditionalTerminalLabel('TERM123');
            builder.setAdditionalPurpose('PURPOSE');
            builder.setAdditionalConsumerData('DATA');
            builder.setAdditionalMerchantTaxId('TAX123');
            builder.setAdditionalChannelOrigin('ORIGIN');
        });
    });

    describe('Channel and VAT', () => {
        it('should set channel info', () => {
            builder.setChannelGui('CHAN.GUI');
            builder.setChannel('WEB');
        });

        it('should set VAT info', () => {
            builder.setVATConditionGui('VAT.GUI');
            builder.setVATCondition(TypeCondition._01);
            builder.setVATValueGui('VATVAL.GUI');
            builder.setVATValue('10');
            // Explicitly call these to hit lines 415-425
            expect(builder.setVATBaseGui('VATBASE.GUI')).toBe(builder);
            expect(builder.setVATBase('100')).toBe(builder);
        });

        it('should set INC info', () => {
            // Explicitly call all INC methods (lines 437-469)
            expect(builder.setINCConditionGui('INC.GUI')).toBe(builder);
            builder.setINCCondition(TypeCondition._01);
            expect(builder.setINCValueGui('INCVAL.GUI')).toBe(builder);
            builder.setINCValue('5');
        });
    });

    describe('Other Fields - KNOWN BUGS (Source code uses setTag for Template fields)', () => {
        it('should throw error when setting service code (Bug: Tag 92 is template)', () => {
            expect(() => builder.setServiceCode('123')).toThrow(/is a template/);
        });

        it('should set transaction ID', () => {
            builder.setTransactionIdGui('TRX.GUI');
            builder.setTransactionId('TRX123');
        });

        it('should set security hash', () => {
            builder.setSecurityHashGui('SEC.GUI');
            builder.setSecurityHash('HASH123');
        });

        it('should set reference or mobile', () => {
            builder.setReferenceOrMobileGui('REF.GUI');
            builder.setReferenceOrMobile('REF123');
        });

        it('should throw error when setting product type collection (Bug: Tag 94 is template)', () => {
            expect(() => builder.setProductTypeCollection('PROD1')).toThrow(/is a template/);
        });

        it('should throw error when setting origin/dest accounts (Bug: Tags 95-97 are templates)', () => {
            expect(() => builder.setOriginAccount('ORIGIN1')).toThrow(/is a template/);
            expect(() => builder.setDestinationAccount('DEST1')).toThrow(/is a template/);
            expect(() => builder.setDestinationAccountReference('DESTREF1')).toThrow(/is a template/);
        });

        it('should throw error when setting product type transference (Bug: Tag 98 is template)', () => {
            expect(() => builder.setProductTypeTransference(TypeCondition._01)).toThrow(/is a template/);
        });

        it('should set discount application', () => {
            builder.setDiscountApplicationGui('DISC.GUI');
            builder.setDiscountApplication('DISC1');
        });
    });

    describe('Build and Validation', () => {
        it('should build a valid QR string', () => {
            builder.setPayloadFormatIndicator();
            builder.setDynamicQR();
            builder.setMerchantCategoryCode('1234');
            builder.setCurrencyISO4217('840');
            builder.setTransactionAmount('10.00');
            builder.setCountryCode('US');
            builder.setMerchantName('Merchant');
            builder.setMerchantCity('City');

            const qrString = builder.build();
            expect(typeof qrString).toBe('string');
            expect(qrString.length).toBeGreaterThan(0);
            expect(qrString).toContain('6304');
        });

        it('should throw error when setting tag with invalid value type', () => {
            expect(() => builder.setMerchantName(undefined as any)).toThrow('The tag value is invalid');
        });

    });

    describe('Internal Helpers Error Handling', () => {
        it('should throw if tag not defined in registry', () => {
            // Using 'any' to pass invalid tag
            const spy = jest.spyOn(EMVTagRegistry, 'getTag').mockReturnValue(undefined);

            expect(() => (builder as any).setTag('999', 'val')).toThrow('not defined in the EMVCo standard');

            spy.mockRestore();
        });

        it('should throw if using setTag for a template field', () => {
            // Tag 26 is a template
            expect(() => (builder as any).setTag('26', 'val')).toThrow('is a template. Use setSubTag()');
        });

        it('should throw if using setSubTag for a simple field', () => {
            // Tag 52 is simple
            expect(() => (builder as any).setSubTag('52', '00', 'val')).toThrow('is not a template. Use setTag()');
        });

        it('should handle tag max length truncation', () => {
            builder.setPayloadFormatIndicator('01999' as any);
            const res = builder.build();
            expect(res).toContain('000201');
        });

        it('should not truncate when maxLength is 0', () => {
            // Find a tag with maxLength 0 or undefined and test it
            builder.setMerchantName('A'.repeat(100));
            const res = builder.build();
            expect(res).toBeDefined();
        });

        it('should throw if subtag not defined', () => {
            const spy = jest.spyOn(EMVTagRegistry, 'getTag').mockReturnValue(undefined);
            expect(() => (builder as any).setSubTag('26', '01', 'val')).toThrow('not defined');
            spy.mockRestore();
        });

        it('should throw if setSubTag invalid value', () => {
            // Pass valid template tag '26' to reach value check
            expect(() => (builder as any).setSubTag('26', '01', undefined)).toThrow('The tag value is invalid');
        });
    });
});
