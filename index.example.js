const emvcode = require("./dist/index");
const fs = require("node:fs");
// eslint-disable-next-line sonarjs/prefer-top-level-await
(async function () {
  try {
    const ACQUIRER_NETWORK_ID = "COM.CO.PULL";
    const emv = new emvcode.EMVCoContentBuilder();
    
    emv
      .setTag("00", "01") // Payload Format Indicator
      .setTag("01", "12") // QR Type
      .setTag("52", "5411") // MCC - Merchant Category Code (Bakery)
      .setTag("53", "840") // Currency Code (USD)
      .setTag("54", "4343") // Transaction Amount
      .setTag("58", "CO") // Country Code - ISO 3166-1
      .setTag("59", "MAICOL BAKERY") // Merchant Name
      .setTag("60", "LA DORADA") // City
      .setTag("61", "17380") // Postal Code

      // === Acquirer Network ID ===
      .setSubTag("26", "00", `${ACQUIRER_NETWORK_ID}.LLA`)
      .setSubTag("26", "05", "27899526")

      // === Network ===
      .setSubTag("49", "00", `${ACQUIRER_NETWORK_ID}.RED`)
      .setSubTag("49", "01", "FULL")

      // === Merchant Code ===
      .setSubTag("50", "00", `${ACQUIRER_NETWORK_ID}.CU`)
      .setSubTag("50", "01", "27899526")

      .setSubTag("51", "00", `${ACQUIRER_NETWORK_ID}.CA`)
      .setSubTag("51", "01", "27899526")

      // === Channel ===
      .setSubTag("80", "00", `${ACQUIRER_NETWORK_ID}.CHANNEL`)
      .setSubTag("80", "01", "POS")

      // === VAT Condition ===
      .setSubTag("81", "00", `${ACQUIRER_NETWORK_ID}.CIVAT`)
      .setSubTag("81", "01", "02")

      // === VAT Value ===
      .setSubTag("82", "00", `${ACQUIRER_NETWORK_ID}.VAT`)
      .setSubTag("82", "01", "0")

      // === VAT Base ===
      .setSubTag("83", "00", `${ACQUIRER_NETWORK_ID}.BASE`)
      .setSubTag("83", "01", "0")

      // === INC Condition ===
      .setSubTag("84", "00", `${ACQUIRER_NETWORK_ID}.CINC`)
      .setSubTag("84", "01", "01")

      // === INC Value ===
      .setSubTag("85", "00", `${ACQUIRER_NETWORK_ID}.INC`)
      .setSubTag("85", "01", "00")

      // === Transaction ID ===
      .setSubTag("90", "00", `${ACQUIRER_NETWORK_ID}.TRXID`)
      .setSubTag("90", "01", "0000942605")

      // === Security Code ===
      .setSubTag("91", "00", `${ACQUIRER_NETWORK_ID}.SEC`)
      .setSubTag("91", "01", "03BcHg1czs5u7LQGzuo7oNIA")

      // === Preference ===
      .setSubTag("93", "00", `${ACQUIRER_NETWORK_ID}.PREF`)
      .setSubTag("93", "01", "3152342121".slice(0, 6))

      // === Alternate Language ===
      .setSubTag("64", "00", "en")
      .setSubTag("64", "01", "MAICOL BAKERY")

      // === Additional Data ===
      .setSubTag("62", "07", "JNZLM808080200")
      .setSubTag("62", "08", "02");

    const trace = emv.build();
    const b64 = emvcode.QrCodeImage.createBase64({
      content: trace,
      errorCorrectionLevel: "L",
    });

    const emvSemantic = new emvcode.EMVCoQrContentSemanticBuilder();
    const keyType = emvcode.EMVField.MERCHANT_ACCOUNT_MERCHANT_ID;

    emvSemantic
      .setPayloadFormatIndicator("01")
      .setDynamicQR()
      .setMerchantAccountGUI(`${ACQUIRER_NETWORK_ID}.LLA`)
      .setMerchantAccountId("27899526", keyType)
      .setNetworkGUI(`${ACQUIRER_NETWORK_ID}.RED`)
      .setNetworkId("FULL")
      .setMerchantCodeGUI(`${ACQUIRER_NETWORK_ID}.CU`)
      .setMerchantCode("27899526")
      .setAggregatorCodeGUI(`${ACQUIRER_NETWORK_ID}.AC`)
      .setAggregatorCode("27899526")
      .setMerchantCategoryCode("5411")
      .setCurrencyISO4217("840")
      .setTransactionAmount("4343")
      .setCountryCode("CO")
      .setMerchantName("MAICOL BAKERY")
      .setMerchantCity("LA DORADA")
      .setPostalCode("17380")
      .setAdditionalBillNumber("808080200")
      .setAdditionalMobileNumber("02")
      .setLanguagePreference("en")
      .setMerchantNameAlt("MAICOL BAKERY")
      .setChannelGui(`${ACQUIRER_NETWORK_ID}.CHANN`)
      .setChannel("POS")
      .setVATConditionGui(`${ACQUIRER_NETWORK_ID}.CIVAT`)
      .setVATCondition("02")
      .setVATValueGui(`${ACQUIRER_NETWORK_ID}.VAT`)
      .setVATValue("0")
      .setVATBaseGui(`${ACQUIRER_NETWORK_ID}.BASE`)
      .setVATBase("0")
      .setINCConditionGui(`${ACQUIRER_NETWORK_ID}.INCC`)
      .setINCCondition("01")
      .setINCValueGui(`${ACQUIRER_NETWORK_ID}.INC`)
      .setINCValue("00")
      .setTransactionIdGui(`${ACQUIRER_NETWORK_ID}.TRXID`)
      .setTransactionId("0000942605")
      .setSecurityHashGui(`${ACQUIRER_NETWORK_ID}.SEC`)
      .setSecurityHash(
        await new emvcode.HashCodeBuilder()
          .setChannel("POS")
          .setTransactionAmount("4343")
          .setTerminalId("001")
          .setTransactionId("0000942605")
          .setUniqueCode("27899526")
          .build(),
      )
      .setReferenceOrMobileGui(`${ACQUIRER_NETWORK_ID}.PREF`)
      .setReferenceOrMobile("315234")
      .setAdditionalPurpose("00");

    const semanticTrace = emvSemantic.build();
    console.log("Semantic QR:", semanticTrace);

    console.log("TLV decoded: ",JSON.stringify(emvcode.EMVTLVService.parse(semanticTrace),null,2));

    const semanticB64 = emvcode.QrCodeImage.createBase64({
      content: semanticTrace,
      errorCorrectionLevel: "L",
    });

    console.log("\nSemantic b64:", semanticB64);

    const trimmedBase64 = semanticB64.slice(2);
    const binaryRaw = emvcode.BinaryToPng.base64ToBinary(trimmedBase64);
    const binary = binaryRaw.replaceAll(/\s+/g, "");

    const rows = Math.floor(Math.sqrt(binary.length));
    const matrixBits = binary.slice(0, rows * rows);

    const png = await emvcode.BinaryToPng.binaryToPNG({
      binary: matrixBits,
      rows,
      reversed: true,
      //foreground: [100, 41, 205],
    });

    fs.writeFileSync(`qr-${Date.now().toString()}.png`, Buffer.from(png));
  } catch (error) {
    console.log("Error:", error);
  }
})();
