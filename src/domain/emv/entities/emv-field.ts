/* ============================
 * SEMANTIC DOMAIN FIELDS (EMVCo v1.4 CO)
 * ============================
 */

import { EMVTag } from "../value-objects/emv-tag";

export enum EMVField {
  // --- Core EMV ---
  PAYLOAD_FORMAT_INDICATOR = "payloadFormatIndicator", // 00
  POINT_OF_INITIATION_METHOD = "pointOfInitiationMethod", // 01
  //CRC = "crc", // 63 (calculado, no settable normalmente)

  // --- Merchant Account Information (26–51) ---
  MERCHANT_ACCOUNT_GUI = "globallyUniqueIdentifier", // 26-00
  MERCHANT_ACCOUNT_ID = "merchantAccountId", // 26-01
  MERCHANT_ACCOUNT_MOBILE = "merchantAccountMobile", // 26-02
  MERCHANT_ACCOUNT_EMAIL = "merchantAccountEmail", // 26-03
  MERCHANT_ACCOUNT_ALPHANUMERIC = "merchantAccountAlphanumeric", // 26-04
  MERCHANT_ACCOUNT_MERCHANT_ID = "merchantAccountMerchantId", // 26-05

  NETWORK_GUI = "networkGui", // 49-00
  NETWORK_ID = "networkId", // 49-01

  MERCHANT_CODE_GUI = "merchantCodeGui", // 50-00
  MERCHANT_CODE = "merchantCode", // 50-01

  AGGREGATOR_CODE_GUI = "aggregatorCodeGui", // 51-00
  AGGREGATOR_CODE = "aggregatorCode", // 51-01

  // --- Merchant Data ---
  MERCHANT_CATEGORY_CODE = "merchantCategoryCode", // 52
  TRANSACTION_CURRENCY = "transactionCurrency", // 53
  TRANSACTION_AMOUNT = "transactionAmount", // 54
  TIP_INDICATOR = "tipIndicator", // 55
  TIP_FIXED_AMOUNT = "tipFixedAmount", // 56
  TIP_PERCENTAGE = "tipPercentage", // 57
  COUNTRY_CODE = "countryCode", // 58
  MERCHANT_NAME = "merchantName", // 59
  MERCHANT_CITY = "merchantCity", // 60
  POSTAL_CODE = "postalCode", // 61

  // --- Additional Data Template (62) ---
  ADDITIONAL_BILL_NUMBER = "additionalBillNumber", // 62-01
  ADDITIONAL_MOBILE_NUMBER = "additionalMobileNumber", // 62-02
  ADDITIONAL_STORE_LABEL = "additionalStoreLabel", // 62-03
  ADDITIONAL_LOYALTY_NUMBER = "additionalLoyaltyNumber", // 62-04
  ADDITIONAL_REFERENCE_LABEL = "additionalReferenceLabel", // 62-05
  ADDITIONAL_CUSTOMER_LABEL = "additionalCustomerLabel", // 62-06
  ADDITIONAL_TERMINAL_LABEL = "additionalTerminalLabel", // 62-07
  ADDITIONAL_PURPOSE = "additionalPurpose", // 62-08
  ADDITIONAL_CONSUMER_DATA = "additionalConsumerData", // 62-09
  ADDITIONAL_MERCHANT_TAX_ID = "additionalMerchantTaxId", // 62-10
  ADDITIONAL_CHANNEL_ORIGIN = "additionalChannelOrigin", // 62-11

  // --- Language Template (64) ---
  LANGUAGE_PREFERENCE = "languagePreference", // 64-00
  MERCHANT_NAME_ALT = "merchantNameAlt", // 64-01
  MERCHANT_CITY_ALT = "merchantCityAlt", // 64-02

  // --- Channel & Taxes (80–85) ---
  CHANNEL_GUI = "channelGui", // 80-00
  CHANNEL = "channel", // 80-01

  VAT_CONDITION_GUI = "vatConditionGui", // 81-00
  VAT_CONDITION = "vatCondition", // 81-01

  VAT_VALUE_GUI = "vatValueGui", // 82-00
  VAT_VALUE = "vatValue", // 82-01

  VAT_BASE_GUI = "vatBaseGui", // 83-00
  VAT_BASE = "vatBase", // 83-01

  INC_CONDITION_GUI = "incConditionGui", // 84-00
  INC_CONDITION = "incCondition", // 84-01
  INC_VALUE_GUI = "incValueGui", // 85-00
  INC_VALUE = "incValue", // 85-01

  // --- Transaction & Security ---
  TRANSACTION_ID_GUI = "transactionIdGui", // 90-01
  TRANSACTION_ID = "transactionId", // 90-01
  SECURITY_HASH_GUI = "securityHashGui", // 91-00
  SECURITY_HASH = "securityHash", // 91-01

  // --- Other Operations ---
  SERVICE_CODE = "serviceCode", // 92
  REFERENCE_OR_MOBILE_GUI = "referenceOrMobileGui", // 93-00
  REFERENCE_OR_MOBILE = "referenceOrMobile", // 93-01
  PRODUCT_TYPE_RECAUDO = "productTypeRecaudo", // 94

  ORIGIN_ACCOUNT = "originAccount", // 95-01
  DESTINATION_ACCOUNT = "destinationAccount", // 96-01
  DESTINATION_ACCOUNT_REF = "destinationAccountRef", // 97-01
  PRODUCT_TYPE_TRANSFER = "productTypeTransfer", // 98-01
  DISCOUNT_APPLICATION_GUI = "discountApplicationGui", // 99-00
  DISCOUNT_APPLICATION = "discountApplication", // 99-01
}
export enum TypeCondition {
  _01 = "01",
  _02 = "02",
  _03 = "03",
}

export type keyType =
  | EMVField.MERCHANT_ACCOUNT_GUI
  | EMVField.MERCHANT_ACCOUNT_ID
  | EMVField.MERCHANT_ACCOUNT_MOBILE
  | EMVField.MERCHANT_ACCOUNT_EMAIL
  | EMVField.MERCHANT_ACCOUNT_ALPHANUMERIC
  | EMVField.MERCHANT_ACCOUNT_MERCHANT_ID;

export type TypeConditionValue =
  | TypeCondition._01
  | TypeCondition._02
  | TypeCondition._03;

/* ============================
 * FIELD → TAG/SUBTAG MAP
 * ============================
 */

export const EMV_FIELD_MAP: Record<EMVField, { tag: EMVTag; subTag?: EMVTag }> =
  {
    // --- Core ---
    [EMVField.PAYLOAD_FORMAT_INDICATOR]: { tag: "00" },
    [EMVField.POINT_OF_INITIATION_METHOD]: { tag: "01" },
    //[EMVField.CRC]: { tag: "63" },

    // --- Merchant Account (26) ---
    [EMVField.MERCHANT_ACCOUNT_GUI]: { tag: "26", subTag: "00" },
    [EMVField.MERCHANT_ACCOUNT_ID]: { tag: "26", subTag: "01" },
    [EMVField.MERCHANT_ACCOUNT_MOBILE]: { tag: "26", subTag: "02" },
    [EMVField.MERCHANT_ACCOUNT_EMAIL]: { tag: "26", subTag: "03" },
    [EMVField.MERCHANT_ACCOUNT_ALPHANUMERIC]: { tag: "26", subTag: "04" },
    [EMVField.MERCHANT_ACCOUNT_MERCHANT_ID]: { tag: "26", subTag: "05" },

    // --- Network (49) ---
    [EMVField.NETWORK_GUI]: { tag: "49", subTag: "00" },
    [EMVField.NETWORK_ID]: { tag: "49", subTag: "01" },

    // --- Merchant Codes (50, 51) ---
    [EMVField.MERCHANT_CODE_GUI]: { tag: "50", subTag: "00" },
    [EMVField.MERCHANT_CODE]: { tag: "50", subTag: "01" },

    [EMVField.AGGREGATOR_CODE_GUI]: { tag: "51", subTag: "00" },
    [EMVField.AGGREGATOR_CODE]: { tag: "51", subTag: "01" },

    // --- Merchant Data ---
    [EMVField.MERCHANT_CATEGORY_CODE]: { tag: "52" },
    [EMVField.TRANSACTION_CURRENCY]: { tag: "53" },
    [EMVField.TRANSACTION_AMOUNT]: { tag: "54" },
    [EMVField.TIP_INDICATOR]: { tag: "55" },
    [EMVField.TIP_FIXED_AMOUNT]: { tag: "56" },
    [EMVField.TIP_PERCENTAGE]: { tag: "57" },
    [EMVField.COUNTRY_CODE]: { tag: "58" },
    [EMVField.MERCHANT_NAME]: { tag: "59" },
    [EMVField.MERCHANT_CITY]: { tag: "60" },
    [EMVField.POSTAL_CODE]: { tag: "61" },

    // --- Additional Data (62) ---
    [EMVField.ADDITIONAL_BILL_NUMBER]: { tag: "62", subTag: "01" },
    [EMVField.ADDITIONAL_MOBILE_NUMBER]: { tag: "62", subTag: "02" },
    [EMVField.ADDITIONAL_STORE_LABEL]: { tag: "62", subTag: "03" },
    [EMVField.ADDITIONAL_LOYALTY_NUMBER]: { tag: "62", subTag: "04" },
    [EMVField.ADDITIONAL_REFERENCE_LABEL]: { tag: "62", subTag: "05" },
    [EMVField.ADDITIONAL_CUSTOMER_LABEL]: { tag: "62", subTag: "06" },
    [EMVField.ADDITIONAL_TERMINAL_LABEL]: { tag: "62", subTag: "07" },
    [EMVField.ADDITIONAL_PURPOSE]: { tag: "62", subTag: "08" },
    [EMVField.ADDITIONAL_CONSUMER_DATA]: { tag: "62", subTag: "09" },
    [EMVField.ADDITIONAL_MERCHANT_TAX_ID]: { tag: "62", subTag: "10" },
    [EMVField.ADDITIONAL_CHANNEL_ORIGIN]: { tag: "62", subTag: "11" },

    // --- Language (64) ---
    [EMVField.LANGUAGE_PREFERENCE]: { tag: "64", subTag: "00" },
    [EMVField.MERCHANT_NAME_ALT]: { tag: "64", subTag: "01" },
    [EMVField.MERCHANT_CITY_ALT]: { tag: "64", subTag: "02" },

    // --- Channel & Taxes ---
    [EMVField.CHANNEL_GUI]: { tag: "80", subTag: "00" },
    [EMVField.CHANNEL]: { tag: "80", subTag: "01" },
    [EMVField.VAT_CONDITION_GUI]: { tag: "81", subTag: "00" },
    [EMVField.VAT_CONDITION]: { tag: "81", subTag: "01" },
    [EMVField.VAT_VALUE_GUI]: { tag: "82", subTag: "00" },
    [EMVField.VAT_VALUE]: { tag: "82", subTag: "01" },
    [EMVField.VAT_BASE_GUI]: { tag: "83", subTag: "00" },
    [EMVField.VAT_BASE]: { tag: "83", subTag: "01" },
    [EMVField.INC_CONDITION_GUI]: { tag: "84", subTag: "00" },
    [EMVField.INC_CONDITION]: { tag: "84", subTag: "01" },
    [EMVField.INC_VALUE_GUI]: { tag: "85", subTag: "00" },
    [EMVField.INC_VALUE]: { tag: "85", subTag: "01" },

    // --- Transaction & Security ---
    [EMVField.TRANSACTION_ID_GUI]: { tag: "90", subTag: "00" },
    [EMVField.TRANSACTION_ID]: { tag: "90", subTag: "01" },
    [EMVField.SECURITY_HASH_GUI]: { tag: "91", subTag: "00" },
    [EMVField.SECURITY_HASH]: { tag: "91", subTag: "01" },

    // --- Other Operations ---
    [EMVField.SERVICE_CODE]: { tag: "92", subTag: "01" },
    [EMVField.REFERENCE_OR_MOBILE_GUI]: { tag: "93", subTag: "00" },
    [EMVField.REFERENCE_OR_MOBILE]: { tag: "93", subTag: "01" },
    [EMVField.PRODUCT_TYPE_RECAUDO]: { tag: "94", subTag: "01" },
    [EMVField.ORIGIN_ACCOUNT]: { tag: "95", subTag: "01" },
    [EMVField.DESTINATION_ACCOUNT]: { tag: "96", subTag: "01" },
    [EMVField.DESTINATION_ACCOUNT_REF]: { tag: "97", subTag: "01" },
    [EMVField.PRODUCT_TYPE_TRANSFER]: { tag: "98", subTag: "01" },
    [EMVField.DISCOUNT_APPLICATION_GUI]: { tag: "99", subTag: "00" },
    [EMVField.DISCOUNT_APPLICATION]: { tag: "99", subTag: "01" },
  } as const;
