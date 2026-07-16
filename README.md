# 🚀 EMVCode

**Herramientas de desarrollo EMVCo para aplicaciones de pago modernas**

[![npm version](https://img.shields.io/npm/v/@somospragma/emvcode.svg)](https://www.npmjs.com/package/@pragmasa/emvcode)

EMVCode es una librería completa para trabajar con códigos QR EMVCo, tags EMV, validación CRC y generación de códigos de seguridad. Perfecta para desarrollar aplicaciones de pago, billeteras digitales y sistemas de cobro.

---

## 📦 Instalación

```bash
npm i @pragmasa/emvcode
```

---

## 🎯 Características

- ✅ **Construcción de QR EMVCo** - Genera códigos QR compatibles con el estándar EMVCo
- ✅ **Builder Semántico** - API intuitiva con métodos descriptivos
- ✅ **Validación CRC16** - Cálculo y validación automática de checksums
- ✅ **Generación de Hash de Seguridad** - SHA-256 para códigos de seguridad
- ✅ **Conversión Binario/Hex** - Utilidades para conversión de formatos
- ✅ **Generación de QR en Base64** - Crea imágenes QR listas para usar
- ✅ **TypeScript First** - Tipado completo y autocompletado

---

## 🚀 Inicio Rápido

### Construcción Básica de QR EMVCo

```typescript
import { EMVCoContentBuilder } from "@somospragma/emvcode";

const emv = new EMVCoContentBuilder();
const ACQUIRER_ID = "COM.CO.MIPAGO";

emv
  .setTag("00", "01") // Payload Format Indicator
  .setTag("01", "12") // QR Dinámico
  .setTag("52", "5411") // MCC - Merchant Category Code
  .setTag("53", "170") // Moneda (COP)
  .setTag("54", "50000") // Monto de transacción
  .setTag("58", "CO") // Código de país
  .setTag("59", "MI TIENDA") // Nombre del comercio
  .setTag("60", "BOGOTA") // Ciudad
  .setSubTag("26", "00", "COM.MIPAGO.ID") // GUI del comercio
  .setSubTag("26", "01", "123456789") // ID del comercio
  .setSubTag("49", "00", `${ACQUIRER_ID}.RED`)
  .setSubTag("49", "01", "FULL")
  .setSubTag("50", "00", `${ACQUIRER_ID}.CU`)
  .setSubTag("50", "01", "27899526")
  .setSubTag("51", "00", `${ACQUIRER_ID}.CA`)
  .setSubTag("51", "01", "27899526")
  .setSubTag("80", "00", `${ACQUIRER_ID}.CHANNEL`)
  .setSubTag("80", "01", "POS")
  .setSubTag("81", "00", `${ACQUIRER_ID}.CIVAT`)
  .setSubTag("81", "01", "02")
  .setSubTag("82", "00", `${ACQUIRER_ID}.VAT`)
  .setSubTag("82", "01", "0")
  .setSubTag("83", "00", `${ACQUIRER_ID}.BASE`)
  .setSubTag("83", "01", "0")
  .setSubTag("84", "00", `${ACQUIRER_ID}.CINC`)
  .setSubTag("84", "01", "01")
  .setSubTag("85", "00", `${ACQUIRER_ID}.INC`)
  .setSubTag("85", "01", "00")
  .setSubTag("90", "00", `${ACQUIRER_ID}.TRXID`)
  .setSubTag("90", "01", "0000942605")
  .setSubTag("91", "00", `${ACQUIRER_ID}.SEC`)
  .setSubTag("91", "01", "03BcHg1czs5u7LQGzuo7oNIA")
  .setSubTag("93", "00", `${ACQUIRER_ID}.PREF`)
  .setSubTag("93", "01", "000961")
  .setSubTag("64", "00", "en")
  .setSubTag("64", "01", "MI TIENDA")
  .setSubTag("62", "07", "JNZLM808080200")
  .setSubTag("62", "08", "02");

const qrString = emv.build();
console.log(qrString);
```

### Construcción Semántica (Recomendado)

```typescript
import { EMVCoContentSemanticBuilder, EMVField } from "@somospragma/emvcode";

const ACQUIRER_ID = "COM.CO.MIPAGO";
const emv = new EMVCoContentSemanticBuilder();
(async function () {
  emv
    .setPayloadFormatIndicator("01")
    .setDynamicQR()
    .setMerchantAccountGUI(`${ACQUIRER_ID}.LLA`)
    .setMerchantAccountId("27899526", EMVField.MERCHANT_ACCOUNT_MERCHANT_ID)
    .setNetworkGUI(`${ACQUIRER_ID}.RED`)
    .setNetworkId("FULL")
    .setMerchantCodeGUI(`${ACQUIRER_ID}.CU`)
    .setMerchantCode("27899526")
    .setAggregatorCodeGUI(`${ACQUIRER_ID}.AC`)
    .setAggregatorCode("27899526")
    .setMerchantCategoryCode("5411")
    .setCurrencyISO4217("840")
    .setTransactionAmount("4343")
    .setCountryCode("CO")
    .setMerchantName("MI TIENDA")
    .setMerchantCity("BOGOTA")
    .setPostalCode("110111")
    .setAdditionalBillNumber("808080200")
    .setAdditionalMobileNumber("02")
    .setLanguagePreference("en")
    .setMerchantNameAlt("MI TIENDA")
    .setChannelGui(`${ACQUIRER_ID}.CHANN`)
    .setChannel("POS")
    .setVATConditionGui(`${ACQUIRER_ID}.CIVAT`)
    .setVATCondition("02")
    .setVATValueGui(`${ACQUIRER_ID}.VAT`)
    .setVATValue("0")
    .setVATBaseGui(`${ACQUIRER_ID}.BASE`)
    .setVATBase("0")
    .setINCConditionGui(`${ACQUIRER_ID}.INCC`)
    .setINCCondition("01")
    .setINCValueGui(`${ACQUIRER_ID}.INC`)
    .setINCValue("00")
    .setTransactionIdGui(`${ACQUIRER_ID}.TRXID`)
    .setTransactionId("0000942605")
    .setSecurityHashGui(`${ACQUIRER_ID}.SEC`)
    .setSecurityHash(
      await new emvcode.HashCodeBuilder()
        .setChannel("POS")
        .setTransactionAmount("4343")
        .setTerminalId("001")
        .setTransactionId("0000942605")
        .setUniqueCode("27899526")
        .build(),
    )
    .setReferenceOrMobileGui(`${ACQUIRER_ID}.PREF`)
    .setReferenceOrMobile("315234")
    .setAdditionalPurpose("00");

  const qrString = emv.build();
})();
```

---

## 📚 API Completa

### EMVCoContentBuilder

Constructor básico para crear códigos QR EMVCo usando tags directamente.

#### Métodos Principales

##### `setTag(tag: string, value: string): this`

Establece un tag simple EMV.

```typescript
emv
  .setTag("00", "01") // Payload Format Indicator
  .setTag("52", "5411") // Merchant Category Code
  .setTag("53", "170"); // Currency Code (COP)
```

##### `setSubTag(templateTag: string, subTag: string, value: string): this`

Establece un sub-tag dentro de un template tag.

```typescript
emv
  .setSubTag("26", "00", "COM.MIPAGO.ID") // GUI
  .setSubTag("26", "01", "123456789") // Merchant ID
  .setSubTag("62", "07", "TERMINAL001"); // Terminal Label
```

##### `build(): string`

Construye y retorna el string del código QR con CRC calculado automáticamente.

```typescript
const qrString = emv.build();
// Retorna: "00020101021152045411530317054055000058..."
```

---

### EMVCoContentSemanticBuilder

Constructor semántico con métodos descriptivos para mayor legibilidad.

#### Configuración Inicial

##### `setAcquirerNetworkId(value: string): this`

Define el identificador de red del adquirente (usado en GUIs).

```typescript
emv.setAcquirerNetworkId("COM.CO.MIPAGO");
// Luego puedes usar: emv.setMerchantAccountGUI(`${emv.acquirerNetworkId}.LLA`)
```

#### Información Básica del QR

##### `setPayloadFormatIndicator(value: '01'): this`

Establece el indicador de formato (siempre '01').

```typescript
emv.setPayloadFormatIndicator("01");
```

##### `setDynamicQR(): this` | `setStaticQR(): this`

Define si el QR es dinámico (un solo uso) o estático (múltiples usos).

```typescript
emv.setDynamicQR(); // Para pagos únicos
// o
emv.setStaticQR(); // Para pagos recurrentes
```

#### Información de Cuenta del Comercio

##### `setMerchantAccountGUI(value: string): this`

Establece el identificador global único del comercio.

```typescript
emv.setMerchantAccountGUI("COM.CO.MIPAGO.LLA");
```

##### `setMerchantAccountId(value: string, keyType: keyType): this`

Establece el ID del comercio con el tipo de identificador.

```typescript
import { EMVField } from "@somospragma/emvcode";

emv.setMerchantAccountId("123456789", EMVField.MERCHANT_ACCOUNT_MERCHANT_ID);
// Otros tipos disponibles:
// - EMVField.MERCHANT_ACCOUNT_ID
// - EMVField.MERCHANT_ACCOUNT_MOBILE
// - EMVField.MERCHANT_ACCOUNT_EMAIL
// - EMVField.MERCHANT_ACCOUNT_ALPHANUMERIC
```

#### Información de Red

##### `setNetworkGUI(value: string): this`

```typescript
emv.setNetworkGUI("COM.CO.MIPAGO.RED");
```

##### `setNetworkId(value: string): this`

```typescript
emv.setNetworkId("FULL");
```

#### Códigos de Comercio y Agregador

##### `setMerchantCodeGUI(value: string): this`

```typescript
emv.setMerchantCodeGUI("COM.CO.MIPAGO.CU");
```

##### `setMerchantCode(value: string): this`

```typescript
emv.setMerchantCode("27899526");
```

##### `setAggregatorCodeGUI(value: string): this`

```typescript
emv.setAggregatorCodeGUI("COM.CO.MIPAGO.AC");
```

##### `setAggregatorCode(value: string): this`

```typescript
emv.setAggregatorCode("27899526");
```

#### Información de Transacción

##### `setMerchantCategoryCode(value: string): this`

Código de categoría del comercio (MCC).

```typescript
emv.setMerchantCategoryCode("5411"); // Supermercados
// Otros ejemplos:
// '5812' - Restaurantes
// '5999' - Tiendas misceláneas
// '4111' - Transporte
```

##### `setCurrencyISO4217(value: string): this`

Código de moneda según ISO 4217.

```typescript
emv.setCurrencyISO4217("170"); // COP (Peso Colombiano)
// Otros ejemplos:
// '840' - USD
// '484' - MXN
// '604' - PEN
```

##### `setTransactionAmount(value: string): this`

Monto de la transacción.

```typescript
emv.setTransactionAmount("50000"); // $50,000 COP
```

##### `setTipIndicator(value: '01' | '02' | '03'): this`

Indicador de propina.

```typescript
emv.setTipIndicator("01");
// '01' - Propina solicitada
// '02' - Propina fija
// '03' - Propina por porcentaje
```

##### `setTipFixedAmount(value: string): this`

```typescript
emv.setTipFixedAmount("5000");
```

##### `setTipPercentage(value: string): this`

```typescript
emv.setTipPercentage("10"); // 10%
```

#### Información del Comercio

##### `setCountryCode(value: string): this`

Código de país ISO 3166-1.

```typescript
emv.setCountryCode("CO"); // Colombia
```

##### `setMerchantName(value: string): this`

```typescript
emv.setMerchantName("TIENDA LA ESQUINA");
```

##### `setMerchantCity(value: string): this`

```typescript
emv.setMerchantCity("BOGOTA");
```

##### `setPostalCode(value: string): this`

```typescript
emv.setPostalCode("110111");
```

#### Datos Adicionales

##### `setAdditionalBillNumber(value: string): this`

```typescript
emv.setAdditionalBillNumber("FACT-2024-001");
```

##### `setAdditionalMobileNumber(value: string): this`

```typescript
emv.setAdditionalMobileNumber("3001234567");
```

##### `setAdditionalStoreLabel(value: string): this`

```typescript
emv.setAdditionalStoreLabel("SUCURSAL-01");
```

##### `setAdditionalTerminalLabel(value: string): this`

```typescript
emv.setAdditionalTerminalLabel("TERMINAL-POS-001");
```

##### `setAdditionalPurpose(value: string): this`

```typescript
emv.setAdditionalPurpose("00");
```

#### Idioma Alternativo

##### `setLanguagePreference(value: string): this`

Código de idioma ISO 639.

```typescript
emv.setLanguagePreference("en"); // Inglés
```

##### `setMerchantNameAlt(value: string): this`

```typescript
emv.setMerchantNameAlt("THE CORNER STORE");
```

##### `setMerchantCityAlt(value: string): this`

```typescript
emv.setMerchantCityAlt("BOGOTA");
```

#### Canal y Origen

##### `setChannelGui(value: string): this`

```typescript
emv.setChannelGui("COM.CO.MIPAGO.CHANNEL");
```

##### `setChannel(value: string): this`

```typescript
emv.setChannel("POS");
// Valores comunes: 'POS', 'WEB', 'APP', 'ATM'
```

#### Impuestos (IVA)

##### `setVATConditionGui(value: string): this`

```typescript
emv.setVATConditionGui("COM.CO.MIPAGO.CIVAT");
```

##### `setVATCondition(value: '01' | '02' | '03'): this`

```typescript
emv.setVATCondition("02");
// '01' - Gravado
// '02' - Exento
// '03' - Excluido
```

##### `setVATValueGui(value: string): this`

```typescript
emv.setVATValueGui("COM.CO.MIPAGO.VAT");
```

##### `setVATValue(value: string): this`

```typescript
emv.setVATValue("9500"); // Valor del IVA
```

##### `setVATBaseGui(value: string): this`

```typescript
emv.setVATBaseGui("COM.CO.MIPAGO.BASE");
```

##### `setVATBase(value: string): this`

```typescript
emv.setVATBase("50000"); // Base gravable
```

#### Impuesto al Consumo (INC)

##### `setINCConditionGui(value: string): this`

```typescript
emv.setINCConditionGui("COM.CO.MIPAGO.CINC");
```

##### `setINCCondition(value: '01' | '02' | '03'): this`

```typescript
emv.setINCCondition("01");
```

##### `setINCValueGui(value: string): this`

```typescript
emv.setINCValueGui("COM.CO.MIPAGO.INC");
```

##### `setINCValue(value: string): this`

```typescript
emv.setINCValue("4000");
```

#### Transacción y Seguridad

##### `setTransactionIdGui(value: string): this`

```typescript
emv.setTransactionIdGui("COM.CO.MIPAGO.TRXID");
```

##### `setTransactionId(value: string): this`

```typescript
emv.setTransactionId("TRX-2024-001234");
```

##### `setSecurityHashGui(value: string): this`

```typescript
emv.setSecurityHashGui("COM.CO.MIPAGO.SEC");
```

##### `setSecurityHash(value: string): this`

```typescript
// Ver HashCodeBuilder para generar el hash
emv.setSecurityHash("03BcHg1czs5u7LQGzuo7oNIA");
```

#### Referencia y Descuentos

##### `setReferenceOrMobileGui(value: string): this`

```typescript
emv.setReferenceOrMobileGui("COM.CO.MIPAGO.PREF");
```

##### `setReferenceOrMobile(value: string): this`

```typescript
emv.setReferenceOrMobile("315234");
```

##### `setDiscountApplicationGui(value: string): this`

```typescript
emv.setDiscountApplicationGui("COM.CO.MIPAGO.DISC");
```

##### `setDiscountApplication(value: string): this`

```typescript
emv.setDiscountApplication("5000");
```

---

### EMVTLVService

Servicio utilitario para leer, construir y convertir payloads EMV en formato TLV
(`tag` + `length` + `value`). Es útil cuando necesitas inspeccionar un QR EMVCo
existente, transformar sus tags o generar una imagen QR desde una estructura ya
parseada.

#### `parse(input: string): TLVNode[]`

Convierte un string TLV en una lista de nodos. Si el valor de un tag contiene
subtags TLV válidos, el servicio los retorna en la propiedad `subtags`; si no,
retorna el valor plano en `value`.

```typescript
import { EMVTLVService } from "@somospragma/emvcode";

const nodes = EMVTLVService.parse(
  "0002010102125204541153031705405500005802CO5909MI TIENDA6006BOGOTA",
);

console.log(nodes);
// [
//   { tag: "00", length: 2, value: "01" },
//   { tag: "01", length: 2, value: "12" },
//   { tag: "52", length: 4, value: "5411" },
//   ...
// ]
```

#### `stringify(nodes: TLVNode[]): string`

Convierte una lista de nodos TLV nuevamente a string. La longitud se calcula con
base en el valor o los subtags, por lo que no necesitas actualizarla manualmente.

```typescript
import { EMVTLVService } from "@somospragma/emvcode";

const payload = EMVTLVService.stringify([
  { tag: "00", length: 2, value: "01" },
  { tag: "01", length: 2, value: "12" },
  {
    tag: "26",
    length: 0,
    subtags: [
      { tag: "00", length: 0, value: "COM.MIPAGO.ID" },
      { tag: "01", length: 0, value: "123456789" },
    ],
  },
  { tag: "52", length: 4, value: "5411" },
  { tag: "53", length: 3, value: "170" },
  { tag: "58", length: 2, value: "CO" },
  { tag: "59", length: 9, value: "MI TIENDA" },
  { tag: "60", length: 6, value: "BOGOTA" },
]);

console.log(payload);
// "00020101021226300013COM.MIPAGO.ID01091234567895204541153031705802CO5909MI TIENDA6006BOGOTA"
```

#### `parseBase64(input: string, config?: QRDecodeConfig): TLVNode[]`

Decodifica un QR generado en Base64 con `QRCodeService` y luego parsea su
contenido TLV.

```typescript
const nodes = EMVTLVService.parseBase64(qrBase64, {
  errorCorrectionLevel: "M",
});
```

#### `toBase64(input: string | TLVNode[], config?: Omit<QRConfig, "content">, genericImage?: boolean): string`

Genera una representación Base64 de QR a partir de un string TLV o de una lista
de nodos. Cuando recibe nodos, primero ejecuta `stringify`.

```typescript
const qrBase64 = EMVTLVService.toBase64(nodes, {
  width: 300,
  errorCorrectionLevel: "M",
});
```

#### Ejemplo completo

```typescript
import { EMVTLVService } from "@somospragma/emvcode";

const nodes = [
  { tag: "00", length: 2, value: "01" },
  { tag: "01", length: 2, value: "12" },
  {
    tag: "26",
    length: 0,
    subtags: [
      { tag: "00", length: 0, value: "COM.CO.MIPAGO.LLA" },
      { tag: "01", length: 0, value: "27899526" },
    ],
  },
  { tag: "52", length: 4, value: "5411" },
  { tag: "53", length: 3, value: "170" },
  { tag: "54", length: 5, value: "50000" },
  { tag: "58", length: 2, value: "CO" },
  { tag: "59", length: 9, value: "MI TIENDA" },
  { tag: "60", length: 6, value: "BOGOTA" },
];

const tlv = EMVTLVService.stringify(nodes);
const parsed = EMVTLVService.parse(tlv);
const qrBase64 = EMVTLVService.toBase64(parsed, {
  width: 300,
  errorCorrectionLevel: "M",
});

console.log(tlv);
console.log(qrBase64);
```

**Errores comunes:**

- `Invalid length for tag XX` - La longitud del tag no es numérica.
- `Length mismatch on tag XX` - El valor real no coincide con la longitud declarada.

---

### QRCodeService (QrCodeImage)

Genera imágenes QR en formato Base64.

#### `createBase64(config: QRConfig): string`

Genera un QR en formato base64 comprimido (incluye el tamaño en el string).

```typescript
import { QRCodeService } from "@somospragma/emvcode";

const qrBase64 = QRCodeService.createBase64({
  content: qrString,
  width: 300,
  errorCorrectionLevel: "L", // 'L', 'M', 'Q', 'H'
});
```

#### `convertToPNG(qrBase64: string, scale?: number): string`

Convierte el base64 generado por createBase64 a una imagen PNG.

```typescript
import { QRCodeService, BinaryToPng } from "@somospragma/emvcode";
(async function () {
  // Generar QR
  const qrBase64 = QRCodeService.createBase64({
    content: emvcoTrace,
    errorCorrectionLevel: "L",
  });

  const trimmedBase64 = qrBase64.slice(2);
  const binaryRaw = BinaryToPng.base64ToBinary(trimmedBase64);
  const binary = binaryRaw.replaceAll(/\s+/g, "");

  const rows = Math.floor(Math.sqrt(binary.length));
  const matrixBits = binary.slice(0, rows * rows);

  const png = await emvcode.BinaryToPng.binaryToPNG({
    binary: matrixBits,
    rows,
    reversed: true,
  });

  // fo Node js
  fs.writeFileSync("qr.png", Buffer.from(png));

  //for Browser
  const blob = new Blob([png], { type: "image/png" });
  img.src = URL.createObjectURL(blob);
})();
```

**Parámetros:**

- `qrBase64` - El base64 generado por createBase64
- `scale` - Factor de escala (default: 10). Cada módulo del QR será scale x scale píxeles

**Niveles de corrección de errores:**

- `L` - Low (7% de recuperación)
- `M` - Medium (15% de recuperación)
- `Q` - Quartile (25% de recuperación)
- `H` - High (30% de recuperación)

---

### CRCService (CRCUtils, Crc)

Cálculo y validación de CRC16-CCITT.

#### `calculateCRC16(data: string): string`

Calcula el CRC16 de una cadena.

```typescript
import { CRCService } from "@somospragma/emvcode";

const crc = CRCService.calculateCRC16("00020101021152045411");
console.log(crc); // 'A1B2'
```

#### `validateCRC16(qrData: string): boolean`

Valida que el CRC de un QR sea correcto.

```typescript
const isValid = CRCService.validateCRC16(qrString);
if (!isValid) {
  console.error("CRC inválido");
}
```

---

### HashCodeBuilder

Genera códigos de seguridad SHA-256 para transacciones.

#### Ejemplo Completo

```typescript
import { HashCodeBuilder } from "@somospragma/emvcode";

const securityHash = await new HashCodeBuilder()
  .setUniqueCode("123456789")
  .setChannel("POS")
  .setTerminalId("TERM-001")
  .setTransactionId("TRX-2024-001234")
  .setTransactionAmount("50000")
  .setTimestamp(Date.now()) // Opcional, usa Date.now() por defecto
  .build();

console.log(securityHash); // '03BcHg1czs5u7LQGzuo7oNIA'
```

#### Métodos

- `setUniqueCode(value: string): this` - Código único del comercio
- `setChannel(value: string): this` - Canal de la transacción
- `setTerminalId(value: string): this` - ID del terminal
- `setTransactionId(value: string): this` - ID de la transacción
- `setTransactionAmount(value: string | number): this` - Monto
- `setTimestamp(timestamp?: number): this` - Timestamp (opcional)
- `setAlgorithmIdentifier(id: AlgorithmIdentifier): this` - Algoritmo (default: 'SHA-256')
- `build(): Promise<string>` - Genera el hash (retorna 24 caracteres)

---

### BinaryHexConverter

Utilidades para conversión entre binario y hexadecimal.

#### `hexToBinary(hex: string): string`

```typescript
import { BinaryHexConverter } from "@somospragma/emvcode";

const binary = BinaryHexConverter.hexToBinary("FF");
console.log(binary); // '11111111'

const binary2 = BinaryHexConverter.hexToBinary("A5");
console.log(binary2); // '10100101'
```

#### `binaryToHex(binary: string): string`

```typescript
const hex = BinaryHexConverter.binaryToHex("11111111");
console.log(hex); // 'ff'

const hex2 = BinaryHexConverter.binaryToHex("1010");
console.log(hex2); // 'a'
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: QR de Pago Simple

```typescript
import { EMVCoContentSemanticBuilder, QRCodeService } from "@somospragma/emvcode";

async function generarQRPago() {
  const emv = new EMVCoContentSemanticBuilder();

  emv
    .setPayloadFormatIndicator("01")
    .setStaticQR()
    .setMerchantCategoryCode("5812") // Restaurante
    .setCurrencyISO4217("170") // COP
    .setCountryCode("CO")
    .setMerchantName("RESTAURANTE EL BUEN SABOR")
    .setMerchantCity("MEDELLIN")
    .setPostalCode("050001");

  const qrString = emv.build();

  const qrImage = QRCodeService.createBase64({
    content: qrString,
    width: 300,
    errorCorrectionLevel: "M",
  });

  return qrImage;
}
```

### Ejemplo 2: QR Dinámico con Seguridad

```typescript
import {
  EMVCoContentSemanticBuilder,
  HashCodeBuilder,
  EMVField,
  QRCodeService,
} from "@somospragma/emvcode";

async function generarQRSeguro() {
  const ACQUIRER = "COM.CO.MIPAGO";
  const merchantId = "123456789";
  const transactionId = `TRX-${Date.now()}`;
  const amount = "75000";

  // Generar hash de seguridad
  const securityHash = await new HashCodeBuilder()
    .setUniqueCode(merchantId)
    .setChannel("POS")
    .setTerminalId("TERM-001")
    .setTransactionId(transactionId)
    .setTransactionAmount(amount)
    .build();

  // Construir QR
  const emv = new EMVCoContentSemanticBuilder();

  emv
    .setPayloadFormatIndicator("01")
    .setDynamicQR()
    .setMerchantAccountGUI(`${ACQUIRER}.LLA`)
    .setMerchantAccountId(merchantId, EMVField.MERCHANT_ACCOUNT_MERCHANT_ID)
    .setMerchantCategoryCode("5411")
    .setCurrencyISO4217("170")
    .setTransactionAmount(amount)
    .setCountryCode("CO")
    .setMerchantName("SUPERMERCADO LA ECONOMIA")
    .setMerchantCity("CALI")
    .setPostalCode("760001")
    .setTransactionIdGui(`${ACQUIRER}.TRXID`)
    .setTransactionId(transactionId)
    .setSecurityHashGui(`${ACQUIRER}.SEC`)
    .setSecurityHash(securityHash)
    .setChannelGui(`${ACQUIRER}.CHANNEL`)
    .setChannel("POS")
    .setAdditionalTerminalLabel("CAJA-01");

  const qrString = emv.build();

  return {
    qrString,
    transactionId,
    securityHash,
  };
}
```

### Ejemplo 3: QR con Impuestos

```typescript
import { EMVCoContentSemanticBuilder } from "@somospragma/emvcode";

function generarQRConImpuestos() {
  const ACQUIRER = "COM.CO.MIPAGO";
  const emv = new EMVCoContentSemanticBuilder();

  const subtotal = 50000;
  const iva = 9500; // 19%
  const total = 59500;

  emv
    .setPayloadFormatIndicator("01")
    .setDynamicQR()
    .setMerchantCategoryCode("5999")
    .setCurrencyISO4217("170")
    .setTransactionAmount(total.toString())
    .setCountryCode("CO")
    .setMerchantName("TIENDA VARIEDADES")
    .setMerchantCity("BARRANQUILLA")
    .setVATConditionGui(`${ACQUIRER}.CIVAT`)
    .setVATCondition("01") // Gravado
    .setVATValueGui(`${ACQUIRER}.VAT`)
    .setVATValue(iva.toString())
    .setVATBaseGui(`${ACQUIRER}.BASE`)
    .setVATBase(subtotal.toString());

  return emv.build();
}
```

### Ejemplo 4: Validación de QR

```typescript
import { CRCService } from "@somospragma/emvcode";

function validarQR(qrString: string): boolean {
  // Validar CRC
  if (!CRCService.validateCRC16(qrString)) {
    console.error("CRC inválido");
    return false;
  }

  // Validar longitud mínima
  if (qrString.length < 50) {
    console.error("QR muy corto");
    return false;
  }

  // Validar formato de payload (primeros 4 caracteres deben ser "0002")
  if (!qrString.startsWith("0002")) {
    console.error("Formato de payload inválido");
    return false;
  }

  console.log("QR válido ✓");
  return true;
}
```

---

## 🏗️ Arquitectura

EMVCode sigue una arquitectura limpia en capas:

```
emvcode/
├── application/          # Builders y casos de uso
│   ├── emv-builder.ts
│   └── emv-semantic-builder.ts
├── domain/
│   ├── emv/             # Lógica de negocio EMV
│   ├── qr/              # Generación de QR
│   └── crypto/          # CRC y Hash
└── shared/              # Utilidades compartidas
```

---

## 📖 Referencia de Tags EMV

### Tags Principales (00-99)

| Tag   | Tipo     | Descripción                  | Requerido |
| ----- | -------- | ---------------------------- | --------- |
| 00    | Simple   | Payload Format Indicator     | ✅        |
| 01    | Simple   | Point of Initiation Method   | ✅        |
| 26-51 | Template | Merchant Account Information | ❌        |
| 52    | Simple   | Merchant Category Code       | ✅        |
| 53    | Simple   | Transaction Currency         | ✅        |
| 54    | Simple   | Transaction Amount           | ❌        |
| 55    | Simple   | Tip Indicator                | ❌        |
| 58    | Simple   | Country Code                 | ✅        |
| 59    | Simple   | Merchant Name                | ✅        |
| 60    | Simple   | Merchant City                | ✅        |
| 61    | Simple   | Postal Code                  | ✅        |
| 62    | Template | Additional Data              | ❌        |
| 63    | Simple   | CRC                          | ✅ (auto) |
| 64    | Template | Language Template            | ❌        |
| 80-99 | Template | Proprietary/National         | ❌        |

---

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Generar coverage
npm run test:coverage
```

---

## 🔧 Desarrollo

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

```

---

## 📝 Notas Importantes

### CRC Automático

El CRC se calcula automáticamente al llamar `build()`. No necesitas agregarlo manualmente.

### Orden de Tags

Los tags se ordenan automáticamente según el estándar EMVCo. No te preocupes por el orden al construir.

### Validación de Longitud

Los valores se truncan automáticamente si exceden la longitud máxima permitida por el estándar.

### Compatibilidad

- ✅ Node.js 14+
- ✅ Navegadores modernos (con Web Crypto API)
- ✅ TypeScript 4.5+

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT © [Tu Nombre]

---

## 🔗 Enlaces

- [Especificación EMVCo QR Code](https://www.emvco.com/emv-technologies/qrcodes/)
- [ISO 4217 - Códigos de Moneda](https://www.iso.org/iso-4217-currency-codes.html)
- [ISO 3166-1 - Códigos de País](https://www.iso.org/iso-3166-country-codes.html)
- [Merchant Category Codes](https://www.citibank.com/tts/solutions/commercial-cards/assets/docs/govt/Merchant-Category-Codes.pdf)

---

**Hecho con ❤️ para la comunidad de desarrolladores de pagos**ixedAmount("5000");
```

##### `setTipPercentage(value: string): this`

```typescript
emv.setTipPercentage("10"); // 10%
```

#### Información del Comercio

##### `setCountryCode(value: string): this`

Código de país ISO 3166-1.

```typescript
emv.setCountryCode("CO"); // Colombia
```

##### `setMerchantName(value: string): this`

```typescript
emv.setMerchantName("TIENDA LA ESQUINA");
```

##### `setMerchantCity(value: string): this`

```typescript
emv.setMerchantCity("BOGOTA");
```

##### `setPostalCode(value: string): this`

```typescript
emv.setPostalCode("110111");
```

#### Datos Adicionales

##### `setAdditionalBillNumber(value: string): this`

```typescript
emv.setAdditionalBillNumber("FACT-2024-001");
```

##### `setAdditionalMobileNumber(value: string): this`

```typescript
emv.setAdditionalMobileNumber("3001234567");
```

##### `setAdditionalStoreLabel(value: string): this`

```typescript
emv.setAdditionalStoreLabel("SUCURSAL-01");
```

##### `setAdditionalTerminalLabel(value: string): this`

```typescript
emv.setAdditionalTerminalLabel("TERMINAL-POS-001");
```

##### `setAdditionalPurpose(value: string): this`

```typescript
emv.setAdditionalPurpose("00");
```

#### Idioma Alternativo

##### `setLanguagePreference(value: string): this`

Código de idioma ISO 639.

```typescript
emv.setLanguagePreference("en"); // Inglés
```

##### `setMerchantNameAlt(value: string): this`

```typescript
emv.setMerchantNameAlt("THE CORNER STORE");
```

##### `setMerchantCityAlt(value: string): this`

```typescript
emv.setMerchantCityAlt("BOGOTA");
```

#### Canal y Origen

##### `setChannelGui(value: string): this`

```typescript
emv.setChannelGui("COM.CO.MIPAGO.CHANNEL");
```

##### `setChannel(value: string): this`

```typescript
emv.setChannel("POS");
// Valores comunes: 'POS', 'WEB', 'APP', 'ATM'
```

#### Impuestos (IVA)

##### `setVATConditionGui(value: string): this`

```typescript
emv.setVATConditionGui("COM.CO.MIPAGO.CIVAT");
```

##### `setVATCondition(value: '01' | '02' | '03'): this`

```typescript
emv.setVATCondition("02");
// '01' - Gravado
// '02' - Exento
// '03' - Excluido
```

##### `setVATValueGui(value: string): this`

```typescript
emv.setVATValueGui("COM.CO.MIPAGO.VAT");
```

##### `setVATValue(value: string): this`

```typescript
emv.setVATValue("9500"); // Valor del IVA
```

##### `setVATBaseGui(value: string): this`

```typescript
emv.setVATBaseGui("COM.CO.MIPAGO.BASE");
```

##### `setVATBase(value: string): this`

```typescript
emv.setVATBase("50000"); // Base gravable
```

#### Impuesto al Consumo (INC)

##### `setINCConditionGui(value: string): this`

```typescript
emv.setINCConditionGui("COM.CO.MIPAGO.CINC");
```

##### `setINCCondition(value: '01' | '02' | '03'): this`

```typescript
emv.setINCCondition("01");
```

##### `setINCValueGui(value: string): this`

```typescript
emv.setINCValueGui("COM.CO.MIPAGO.INC");
```

##### `setINCValue(value: string): this`

```typescript
emv.setINCValue("4000");
```

#### Transacción y Seguridad

##### `setTransactionIdGui(value: string): this`

```typescript
emv.setTransactionIdGui("COM.CO.MIPAGO.TRXID");
```

##### `setTransactionId(value: string): this`

```typescript
emv.setTransactionId("TRX-2024-001234");
```

##### `setSecurityHashGui(value: string): this`

```typescript
emv.setSecurityHashGui("COM.CO.MIPAGO.SEC");
```

##### `setSecurityHash(value: string): this`

```typescript
// Ver HashCodeBuilder para generar el hash
emv.setSecurityHash("03BcHg1czs5u7LQGzuo7oNIA");
```

#### Referencia y Descuentos

##### `setReferenceOrMobileGui(value: string): this`

```typescript
emv.setReferenceOrMobileGui("COM.CO.MIPAGO.PREF");
```

##### `setReferenceOrMobile(value: string): this`

```typescript
emv.setReferenceOrMobile("315234");
```

##### `setDiscountApplicationGui(value: string): this`

```typescript
emv.setDiscountApplicationGui("COM.CO.MIPAGO.DISC");
```

##### `setDiscountApplication(value: string): this`

```typescript
emv.setDiscountApplication("5000");
```

---

### QRCodeService (QrCodeImage)

Genera imágenes QR en formato Base64.

#### `createBase64(config: QRConfig): string`

Genera un QR en formato base64 comprimido (incluye el tamaño en el string).

```typescript
import { QRCodeService } from "@somospragma/emvcode";

const qrBase64 = QRCodeService.createBase64({
  content: qrString,
  width: 300,
  errorCorrectionLevel: "L", // 'L', 'M', 'Q', 'H'
});
```

#### `convertToPNG(qrBase64: string, scale?: number): string`

Convierte el base64 generado por createBase64 a una imagen PNG.

```typescript
import { QRCodeService, BinaryToPng } from "@somospragma/emvcode";
(async function () {
  // Generar QR
  const qrBase64 = QRCodeService.createBase64({
    content: emvcoTrace,
    errorCorrectionLevel: "L",
  });

  const trimmedBase64 = qrBase64.slice(2);
  const binaryRaw = BinaryToPng.base64ToBinary(trimmedBase64);
  const binary = binaryRaw.replaceAll(/\s+/g, "");

  const rows = Math.floor(Math.sqrt(binary.length));
  const matrixBits = binary.slice(0, rows * rows);

  const png = await emvcode.BinaryToPng.binaryToPNG({
    binary: matrixBits,
    rows,
    reversed: true,
  });

  // fo Node js
  fs.writeFileSync("qr.png", Buffer.from(png));

  //for Browser
  const blob = new Blob([png], { type: "image/png" });
  img.src = URL.createObjectURL(blob);
})();
```

**Parámetros:**

- `qrBase64` - El base64 generado por createBase64
- `scale` - Factor de escala (default: 10). Cada módulo del QR será scale x scale píxeles

**Niveles de corrección de errores:**

- `L` - Low (7% de recuperación)
- `M` - Medium (15% de recuperación)
- `Q` - Quartile (25% de recuperación)
- `H` - High (30% de recuperación)

---

### CRCService (CRCUtils, Crc)

Cálculo y validación de CRC16-CCITT.

#### `calculateCRC16(data: string): string`

Calcula el CRC16 de una cadena.

```typescript
import { CRCService } from "@somospragma/emvcode";

const crc = CRCService.calculateCRC16("00020101021152045411");
console.log(crc); // 'A1B2'
```

#### `validateCRC16(qrData: string): boolean`

Valida que el CRC de un QR sea correcto.

```typescript
const isValid = CRCService.validateCRC16(qrString);
if (!isValid) {
  console.error("CRC inválido");
}
```

---

### HashCodeBuilder

Genera códigos de seguridad SHA-256 para transacciones.

#### Ejemplo Completo

```typescript
import { HashCodeBuilder } from "@somospragma/emvcode";

const securityHash = await new HashCodeBuilder()
  .setUniqueCode("123456789")
  .setChannel("POS")
  .setTerminalId("TERM-001")
  .setTransactionId("TRX-2024-001234")
  .setTransactionAmount("50000")
  .setTimestamp(Date.now()) // Opcional, usa Date.now() por defecto
  .build();

console.log(securityHash); // '03BcHg1czs5u7LQGzuo7oNIA'
```

#### Métodos

- `setUniqueCode(value: string): this` - Código único del comercio
- `setChannel(value: string): this` - Canal de la transacción
- `setTerminalId(value: string): this` - ID del terminal
- `setTransactionId(value: string): this` - ID de la transacción
- `setTransactionAmount(value: string | number): this` - Monto
- `setTimestamp(timestamp?: number): this` - Timestamp (opcional)
- `setAlgorithmIdentifier(id: AlgorithmIdentifier): this` - Algoritmo (default: 'SHA-256')
- `build(): Promise<string>` - Genera el hash (retorna 24 caracteres)

---

### BinaryHexConverter

Utilidades para conversión entre binario y hexadecimal.

#### `hexToBinary(hex: string): string`

```typescript
import { BinaryHexConverter } from "@somospragma/emvcode";

const binary = BinaryHexConverter.hexToBinary("FF");
console.log(binary); // '11111111'

const binary2 = BinaryHexConverter.hexToBinary("A5");
console.log(binary2); // '10100101'
```

#### `binaryToHex(binary: string): string`

```typescript
const hex = BinaryHexConverter.binaryToHex("11111111");
console.log(hex); // 'ff'

const hex2 = BinaryHexConverter.binaryToHex("1010");
console.log(hex2); // 'a'
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: QR de Pago Simple

```typescript
import { EMVCoContentSemanticBuilder, QRCodeService } from "@somospragma/emvcode";

async function generarQRPago() {
  const emv = new EMVCoContentSemanticBuilder();

  emv
    .setPayloadFormatIndicator("01")
    .setStaticQR()
    .setMerchantCategoryCode("5812") // Restaurante
    .setCurrencyISO4217("170") // COP
    .setCountryCode("CO")
    .setMerchantName("RESTAURANTE EL BUEN SABOR")
    .setMerchantCity("MEDELLIN")
    .setPostalCode("050001");

  const qrString = emv.build();

  const qrImage = QRCodeService.createBase64({
    content: qrString,
    width: 300,
    errorCorrectionLevel: "M",
  });

  return qrImage;
}
```

### Ejemplo 2: QR Dinámico con Seguridad

```typescript
import {
  EMVCoContentSemanticBuilder,
  HashCodeBuilder,
  EMVField,
  QRCodeService,
} from "@somospragma/emvcode";

async function generarQRSeguro() {
  const ACQUIRER = "COM.CO.MIPAGO";
  const merchantId = "123456789";
  const transactionId = `TRX-${Date.now()}`;
  const amount = "75000";

  // Generar hash de seguridad
  const securityHash = await new HashCodeBuilder()
    .setUniqueCode(merchantId)
    .setChannel("POS")
    .setTerminalId("TERM-001")
    .setTransactionId(transactionId)
    .setTransactionAmount(amount)
    .build();

  // Construir QR
  const emv = new EMVCoContentSemanticBuilder();

  emv
    .setPayloadFormatIndicator("01")
    .setDynamicQR()
    .setMerchantAccountGUI(`${ACQUIRER}.LLA`)
    .setMerchantAccountId(merchantId, EMVField.MERCHANT_ACCOUNT_MERCHANT_ID)
    .setMerchantCategoryCode("5411")
    .setCurrencyISO4217("170")
    .setTransactionAmount(amount)
    .setCountryCode("CO")
    .setMerchantName("SUPERMERCADO LA ECONOMIA")
    .setMerchantCity("CALI")
    .setPostalCode("760001")
    .setTransactionIdGui(`${ACQUIRER}.TRXID`)
    .setTransactionId(transactionId)
    .setSecurityHashGui(`${ACQUIRER}.SEC`)
    .setSecurityHash(securityHash)
    .setChannelGui(`${ACQUIRER}.CHANNEL`)
    .setChannel("POS")
    .setAdditionalTerminalLabel("CAJA-01");

  const qrString = emv.build();

  return {
    qrString,
    transactionId,
    securityHash,
  };
}
```

### Ejemplo 3: QR con Impuestos

```typescript
import { EMVCoContentSemanticBuilder } from "@somospragma/emvcode";

function generarQRConImpuestos() {
  const ACQUIRER = "COM.CO.MIPAGO";
  const emv = new EMVCoContentSemanticBuilder();

  const subtotal = 50000;
  const iva = 9500; // 19%
  const total = 59500;

  emv
    .setPayloadFormatIndicator("01")
    .setDynamicQR()
    .setMerchantCategoryCode("5999")
    .setCurrencyISO4217("170")
    .setTransactionAmount(total.toString())
    .setCountryCode("CO")
    .setMerchantName("TIENDA VARIEDADES")
    .setMerchantCity("BARRANQUILLA")
    .setVATConditionGui(`${ACQUIRER}.CIVAT`)
    .setVATCondition("01") // Gravado
    .setVATValueGui(`${ACQUIRER}.VAT`)
    .setVATValue(iva.toString())
    .setVATBaseGui(`${ACQUIRER}.BASE`)
    .setVATBase(subtotal.toString());

  return emv.build();
}
```

### Ejemplo 4: Validación de QR

```typescript
import { CRCService } from "@somospragma/emvcode";

function validarQR(qrString: string): boolean {
  // Validar CRC
  if (!CRCService.validateCRC16(qrString)) {
    console.error("CRC inválido");
    return false;
  }

  // Validar longitud mínima
  if (qrString.length < 50) {
    console.error("QR muy corto");
    return false;
  }

  // Validar formato de payload (primeros 4 caracteres deben ser "0002")
  if (!qrString.startsWith("0002")) {
    console.error("Formato de payload inválido");
    return false;
  }

  console.log("QR válido ✓");
  return true;
}
```

---

## 🏗️ Arquitectura

EMVCode sigue una arquitectura limpia en capas:

```
emvcode/
├── application/          # Builders y casos de uso
│   ├── emv-builder.ts
│   └── emv-semantic-builder.ts
├── domain/
│   ├── emv/             # Lógica de negocio EMV
│   ├── qr/              # Generación de QR
│   └── crypto/          # CRC y Hash
└── shared/              # Utilidades compartidas
```

---

## 📖 Referencia de Tags EMV

### Tags Principales (00-99)

| Tag   | Tipo     | Descripción                  | Requerido |
| ----- | -------- | ---------------------------- | --------- |
| 00    | Simple   | Payload Format Indicator     | ✅        |
| 01    | Simple   | Point of Initiation Method   | ✅        |
| 26-51 | Template | Merchant Account Information | ❌        |
| 52    | Simple   | Merchant Category Code       | ✅        |
| 53    | Simple   | Transaction Currency         | ✅        |
| 54    | Simple   | Transaction Amount           | ❌        |
| 55    | Simple   | Tip Indicator                | ❌        |
| 58    | Simple   | Country Code                 | ✅        |
| 59    | Simple   | Merchant Name                | ✅        |
| 60    | Simple   | Merchant City                | ✅        |
| 61    | Simple   | Postal Code                  | ✅        |
| 62    | Template | Additional Data              | ❌        |
| 63    | Simple   | CRC                          | ✅ (auto) |
| 64    | Template | Language Template            | ❌        |
| 80-99 | Template | Proprietary/National         | ❌        |

---

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Generar coverage
npm run test:coverage
```

---

## 🔧 Desarrollo

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

```

---

## 📝 Notas Importantes

### CRC Automático

El CRC se calcula automáticamente al llamar `build()`. No necesitas agregarlo manualmente.

### Orden de Tags

Los tags se ordenan automáticamente según el estándar EMVCo. No te preocupes por el orden al construir.

### Validación de Longitud

Los valores se truncan automáticamente si exceden la longitud máxima permitida por el estándar.

### Compatibilidad

- ✅ Node.js 14+
- ✅ Navegadores modernos (con Web Crypto API)
- ✅ TypeScript 4.5+

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT © [Tu Nombre]

---

## 🔗 Enlaces

- [Especificación EMVCo QR Code](https://www.emvco.com/emv-technologies/qrcodes/)
- [ISO 4217 - Códigos de Moneda](https://www.iso.org/iso-4217-currency-codes.html)
- [ISO 3166-1 - Códigos de País](https://www.iso.org/iso-3166-country-codes.html)
- [Merchant Category Codes](https://www.citibank.com/tts/solutions/commercial-cards/assets/docs/govt/Merchant-Category-Codes.pdf)

---

**Hecho con ❤️ para la comunidad de desarrolladores de pagos**
