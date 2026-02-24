import { EMVQRCodeContent } from "../domain/emv/entities/emv-qr-code";
import { EMVTag } from "../domain/emv/value-objects/emv-tag";
import { EMVTagRegistry } from "../domain/emv/services/emv-tag-registry";
import { CRCService } from "../domain/crypto/services/crc-service";
import {
  EMV_FIELD_MAP,
  EMVField,
  keyType,
  TypeConditionValue,
} from "../domain/emv/entities/emv-field";
import { Formatter } from "./formatter";

export class EMVCoContentSemanticBuilder extends Formatter {
  private readonly qrCode = new EMVQRCodeContent();
  public acquirerNetworkId: string = "COM.ACQUIRER";

  setAcquirerNetworkId(value: string) {
    if (!this.isValidValue(value)) {
      throw new Error("Invalid Acquirer network id value");
    }

    this.acquirerNetworkId = value.toUpperCase();

    return this;
  }

  /**
   * @description Set Payload Format Indicator - Tag 00
   */
  setPayloadFormatIndicator(value: "01" = "01"): this {
    return this.setTag(
      EMV_FIELD_MAP[EMVField.PAYLOAD_FORMAT_INDICATOR].tag,
      value.trim()
    );
  }

  /**
   * @description Set Point of Initiation Method as Dynamic type - Tag 00
   */
  setDynamicQR() {
    return this.setTag(
      EMV_FIELD_MAP[EMVField.POINT_OF_INITIATION_METHOD].tag,
      "12"
    );
  }

  /**
   * @description Set Point of Initiation Method as Static type - Tag 00
   */
  setStaticQR() {
    return this.setTag(
      EMV_FIELD_MAP[EMVField.POINT_OF_INITIATION_METHOD].tag,
      "11"
    );
  }

  /**
   * @description Set Merchant account - Tag 26 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setMerchantAccountGUI(`${trace.acquirerNetworkId}.KEY`)
   * ```
   */
  setMerchantAccountGUI(value: string): this {
    const emvTag = EMV_FIELD_MAP[EMVField.MERCHANT_ACCOUNT_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "", value);
  }

  /**
   * @description Set merchantAccountId - Tag 26 Sub tag 01 | 02 | 03 | 04 | 05
   */
  setMerchantAccountId(value: string, keyType: keyType) {
    const emvTag = EMV_FIELD_MAP[keyType];

    if (!emvTag?.subTag) {
      throw new Error("Invalid key type");
    }

    return this.setSubTag(emvTag.tag, emvTag.subTag, value);
  }

  /**
   * @description Set Network ID - Tag 49 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setNetworkGUI(`${trace.acquirerNetworkId}.NET`)
   * ```
   */
  setNetworkGUI(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.NETWORK_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set setNetworkId - Tag 49 Sub tag 01
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setNetworkId('PAYX')
   * ```
   */
  setNetworkId(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.NETWORK_ID];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set Merchant Code - Tag 50 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setMerchantCodeGUI(`${trace.acquirerNetworkId}.CC`)
   * ```
   */
  setMerchantCodeGUI(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.MERCHANT_CODE_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set merchant code - Tag 50 Sub tag 01
   */
  setMerchantCode(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.MERCHANT_CODE];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set Aggregator Code - Tag 51 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setAggregatorCodeGUI(`${trace.acquirerNetworkId}.AC`)
   * ```
   */
  setAggregatorCodeGUI(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.AGGREGATOR_CODE_GUI];

    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set merchant code - Tag 51 Sub tag 01
   */
  setAggregatorCode(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.AGGREGATOR_CODE];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set Merchant Category code - Tag 52
   */
  setMerchantCategoryCode(value: string) {
    return this.setTag(
      EMV_FIELD_MAP[EMVField.MERCHANT_CATEGORY_CODE].tag,
      value
    );
  }

  /**
   * @description Set Currency code - Tag 53 ISO 4217
   */
  setCurrencyISO4217(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.TRANSACTION_CURRENCY].tag, value);
  }

  /**
   * @description Set Transaction amount - Tag 54
   */
  setTransactionAmount(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.TRANSACTION_AMOUNT].tag, value);
  }

  /**
   * @description Set Tip indicator - Tag 55
   */
  setTipIndicator(value: TypeConditionValue) {
    return this.setTag(EMV_FIELD_MAP[EMVField.TIP_INDICATOR].tag, value);
  }

  /**
   * @description Set Tip fixed amount - Tag 56
   */
  setTipFixedAmount(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.TIP_FIXED_AMOUNT].tag, value);
  }

  /**
   * @description Set Tip percentage - Tag 57
   */
  setTipPercentage(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.TIP_PERCENTAGE].tag, value);
  }

  /**
   * @description Set Country code - Tag 58 ISO 3166-1
   */
  setCountryCode(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.COUNTRY_CODE].tag, value);
  }

  /**
   * @description Set Merchant name - Tag 59
   */
  setMerchantName(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.MERCHANT_NAME].tag, value);
  }

  /**
   * @description Set Merchant city - Tag 60
   */
  setMerchantCity(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.MERCHANT_CITY].tag, value);
  }

  /**
   * @description Set Postal code - Tag 61
   */
  setPostalCode(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.POSTAL_CODE].tag, value);
  }

  /**
   * @description Set Additional billing number  - Tag 62 sub tag 01
   */
  setAdditionalBillNumber(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.ADDITIONAL_BILL_NUMBER];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set Additional mobile number  - Tag 62 sub tag 02
   */
  setAdditionalMobileNumber(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.ADDITIONAL_MOBILE_NUMBER];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "02", value);
  }

  /**
   * @description Set Additional store label - Tag 62 sub tag 03
   */
  setAdditionalStoreLabel(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.ADDITIONAL_STORE_LABEL];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "03", value);
  }

  /**
   * @description Set Additional loyalty number - Tag 62 sub tag 04
   */
  setAdditionalLoyaltyNumber(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.ADDITIONAL_LOYALTY_NUMBER];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "04", value);
  }

  /**
   * @description Set Additional reference label - Tag 62 sub tag 05
   */
  setAdditionalReferenceLabel(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.ADDITIONAL_REFERENCE_LABEL];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "05", value);
  }

  /**
   * @description Set Additional customer label - Tag 62 sub tag 06
   */
  setAdditionalCustomerLabel(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.ADDITIONAL_CUSTOMER_LABEL];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "06", value);
  }

  /**
   * @description Set Additional terminal label - Tag 62 sub tag 07
   */
  setAdditionalTerminalLabel(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.ADDITIONAL_TERMINAL_LABEL];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "07", value);
  }

  /**
   * @description Set Additional purpose - Tag 62 sub tag 08
   */
  setAdditionalPurpose(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.ADDITIONAL_PURPOSE];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "08", value);
  }

  /**
   * @description Set Additional customer data - Tag 62 sub tag 09
   */
  setAdditionalConsumerData(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.ADDITIONAL_CONSUMER_DATA];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "09", value);
  }

  /**
   * @description Set Additional merchant tax id - Tag 62 sub tag 10
   */
  setAdditionalMerchantTaxId(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.ADDITIONAL_MERCHANT_TAX_ID];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "10", value);
  }

  /**
   * @description Set Additional channel origin - Tag 62 sub tag 11
   */
  setAdditionalChannelOrigin(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.ADDITIONAL_MERCHANT_TAX_ID];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "11", value);
  }

  /**
   * @description Set Language preference- Tag 64 sub tag 00 ISO 639
   */
  setLanguagePreference(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.LANGUAGE_PREFERENCE];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set Merchant name alt - Tag 64 sub tag 01
   */
  setMerchantNameAlt(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.MERCHANT_NAME_ALT];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set Merchant city alt - Tag 64 sub tag 02
   */
  setMerchantCityAlt(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.MERCHANT_CITY_ALT];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "02", value);
  }

  /**
   * @description Set Channel ID - Tag 80 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setChannelGui(`${trace.acquirerNetworkId}.CHANNEL`)
   * ```
   */
  setChannelGui(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.CHANNEL_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set Channel - Tag 80 sub tag 01
   */
  setChannel(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.CHANNEL];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set VAT Condition ID - Tag 81 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setVATConditionGui(`${trace.acquirerNetworkId}.VATI`)
   * ```
   */
  setVATConditionGui(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.VAT_CONDITION_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set VAT condition - Tag 81 sub tag 01 - 01 | 02 | 03
   */
  setVATCondition(value: TypeConditionValue) {
    const emvTag = EMV_FIELD_MAP[EMVField.VAT_CONDITION];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set VAT value ID - Tag 82 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setVATValueGui(`${trace.acquirerNetworkId}.VAT`)
   * ```
   */
  setVATValueGui(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.VAT_VALUE_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set VAT value - Tag 82 sub tag 01
   */
  setVATValue(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.VAT_VALUE];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set VAT Base ID - Tag 83 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setVATBaseGui(`${trace.acquirerNetworkId}.BASE`)
   * ```
   */
  setVATBaseGui(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.VAT_BASE_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set VAT base - Tag 83 sub tag 01
   */
  setVATBase(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.VAT_BASE];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set INC Condition ID - Tag 84 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setVATBaseGui(`${trace.acquirerNetworkId}.INCC`)
   * ```
   */
  setINCConditionGui(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.INC_CONDITION_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set INC condition - Tag 84 sub tag 01 - 01 | 02 | 03
   */
  setINCCondition(value: TypeConditionValue) {
    const emvTag = EMV_FIELD_MAP[EMVField.INC_CONDITION];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set INC value ID - Tag 85 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setINCValueGui(`${trace.acquirerNetworkId}.INC`)
   * ```
   */
  setINCValueGui(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.INC_VALUE_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set INC value - Tag 85 sub tag 01 - 01 | 02 | 03
   */
  setINCValue(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.INC_VALUE];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set Transaction ID - Tag 90 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setTransactionIdGui(`${trace.acquirerNetworkId}.TRXID`)
   * ```
   */
  setTransactionIdGui(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.TRANSACTION_ID_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set Transaction ID value - Tag 90 sub tag 01
   */
  setTransactionId(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.TRANSACTION_ID];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set Security hash - Tag 91 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setSecurityHashGui(`${trace.acquirerNetworkId}.SEC`)
   * ```
   */
  setSecurityHashGui(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.SECURITY_HASH_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set Security hash value - Tag 91 sub tag 01
   */
  setSecurityHash(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.SECURITY_HASH];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set Service code - Tag 92
   */
  setServiceCode(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.SERVICE_CODE].tag, value);
  }

  /**
   * @description Set Reference collection or mobile ID - Tag 93 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setReferenceOrMobileGui(`${trace.acquirerNetworkId}.PREF`)
   * ```
   */
  setReferenceOrMobileGui(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.REFERENCE_OR_MOBILE_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set Reference collection or mobile - Tag 93 Sub tag 01
   */
  setReferenceOrMobile(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.REFERENCE_OR_MOBILE];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  /**
   * @description Set Product type collection - Tag 94
   */
  setProductTypeCollection(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.PRODUCT_TYPE_RECAUDO].tag, value);
  }

  /**
   * @description Set Origin account - Tag 95
   */
  setOriginAccount(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.ORIGIN_ACCOUNT].tag, value);
  }

  /**
   * @description Set Destination account - Tag 96
   */
  setDestinationAccount(value: string) {
    return this.setTag(EMV_FIELD_MAP[EMVField.DESTINATION_ACCOUNT].tag, value);
  }

  /**
   * @description Set Destination account reference - Tag 97
   */
  setDestinationAccountReference(value: string) {
    return this.setTag(
      EMV_FIELD_MAP[EMVField.DESTINATION_ACCOUNT_REF].tag,
      value
    );
  }

  /**
   * @description Set Product type transference - Tag 98
   */
  setProductTypeTransference(value: TypeConditionValue) {
    return this.setTag(
      EMV_FIELD_MAP[EMVField.PRODUCT_TYPE_TRANSFER].tag,
      value
    );
  }

  /**
   * @description Set Discount application ID - Tag 99 Sub tag 00
   *
   * ```js
   *  const trace = new EMVCoSemanticBuilder();
   *  trace.setAcquirerNetworkId(ACQUIRER_NETWORK_ID)
   *  trace.setDiscountApplicationGui(`${trace.acquirerNetworkId}.DISC`)
   * ```
   */
  setDiscountApplicationGui(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.DISCOUNT_APPLICATION_GUI];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "00", value);
  }

  /**
   * @description Set Discount application value - Tag 99 Sub tag 01
   */
  setDiscountApplication(value: string) {
    const emvTag = EMV_FIELD_MAP[EMVField.DISCOUNT_APPLICATION];
    return this.setSubTag(emvTag.tag, emvTag.subTag ?? "01", value);
  }

  build(): string {
    const qrBody: string[] = [];

    const simpleFields = [...this.qrCode.getAllFields().entries()];
    const templateFields = this.processTemplateFields();

    const allTags: [string, string][] = [...simpleFields, ...templateFields];
    const sortedTags = [...allTags].sort(([a], [b]) => a.localeCompare(b));

    this.buildQrBody(qrBody, sortedTags);
    this.addCrcToQrBody(qrBody);

    this.qrCode.clear();
    return qrBody.join("");
  }

  setTag(tag: EMVTag, value: string): this {
    const tagInfo = EMVTagRegistry.getTag(tag);

    if (!tagInfo) {
      throw new Error(`Tag ${tag} is not defined in the EMVCo standard`);
    }
    if (tagInfo.type !== "simple") {
      throw new Error(`Tag ${tag} is a template. Use setSubTag()`);
    }

    if (!this.isValidValue(value)) {
      throw new Error(`The tag value is invalid ${typeof value}`);
    }

    if (tagInfo.maxLength && tagInfo.maxLength > 0) {
      value = value.slice(0, tagInfo.maxLength);
    }

    this.qrCode.setField(tag, value);
    return this;
  }

  setSubTag(templateTag: EMVTag, subTag: string, value: string): this {
    const tagInfo = EMVTagRegistry.getTag(templateTag);

    if (!tagInfo) {
      throw new Error(
        `Tag ${templateTag} is not defined in the EMVCo standard`
      );
    }

    if (tagInfo.type !== "template") {
      throw new Error(`Tag ${templateTag} is not a template. Use setTag()`);
    }

    if (!this.isValidValue(value)) {
      throw new Error(`The tag value is invalid ${typeof value}`);
    }

    this.qrCode.setSubField(templateTag, subTag, value);
    return this;
  }

  private processTemplateFields(): [string, string][] {
    return Array.from(this.qrCode.getAllTemplates().entries()).map(
      ([tag, subfields]): [string, string] => {
        const sortedSubfields = [...subfields.entries()].sort(([a], [b]) =>
          a.localeCompare(b)
        );

        let subBody = "";
        for (const [subTag, value] of sortedSubfields) {
          subBody += this.formatTag(subTag, value);
        }

        return [tag, subBody];
      }
    );
  }

  private addCrcToQrBody(qrBody: string[]): void {
    const crcInput = `${qrBody.join("")}6304`;
    const crc = CRCService.calculateCRC16(crcInput);
    qrBody.push(`6304${crc}`);
  }
}
