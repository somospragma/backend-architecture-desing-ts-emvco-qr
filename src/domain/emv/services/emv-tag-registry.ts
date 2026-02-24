import { EMVTag, EMVTagValue } from '../value-objects/emv-tag';

export class EMVTagRegistry {
  private static readonly TAGS: Record<EMVTag, EMVTagValue> = {
    // EMVCo Core
    '00': EMVTagValue.createSimple('00', 'Payload Format Indicator', true, 2),
    '01': EMVTagValue.createSimple('01', 'Point of Initiation Method', true, 2),
    
    // Reserved for EMVCo (02–25)
    '02': EMVTagValue.createSimple('02', 'Reserved for EMVCo', false),
    '03': EMVTagValue.createSimple('03', 'Reserved for EMVCo', false),
    '04': EMVTagValue.createSimple('04', 'Reserved for EMVCo', false),
    '05': EMVTagValue.createSimple('05', 'Reserved for EMVCo', false),
    '06': EMVTagValue.createSimple('06', 'Reserved for EMVCo', false),
    '07': EMVTagValue.createSimple('07', 'Reserved for EMVCo', false),
    '08': EMVTagValue.createSimple('08', 'Reserved for EMVCo', false),
    '09': EMVTagValue.createSimple('09', 'Reserved for EMVCo', false),
    '10': EMVTagValue.createSimple('10', 'Reserved for EMVCo', false),
    '11': EMVTagValue.createSimple('11', 'Reserved for EMVCo', false),
    '12': EMVTagValue.createSimple('12', 'Reserved for EMVCo', false),
    '13': EMVTagValue.createSimple('13', 'Reserved for EMVCo', false),
    '14': EMVTagValue.createSimple('14', 'Reserved for EMVCo', false),
    '15': EMVTagValue.createSimple('15', 'Reserved for EMVCo', false),
    '16': EMVTagValue.createSimple('16', 'Reserved for EMVCo', false),
    '17': EMVTagValue.createSimple('17', 'Reserved for EMVCo', false),
    '18': EMVTagValue.createSimple('18', 'Reserved for EMVCo', false),
    '19': EMVTagValue.createSimple('19', 'Reserved for EMVCo', false),
    '20': EMVTagValue.createSimple('20', 'Reserved for EMVCo', false),
    '21': EMVTagValue.createSimple('21', 'Reserved for EMVCo', false),
    '22': EMVTagValue.createSimple('22', 'Reserved for EMVCo', false),
    '23': EMVTagValue.createSimple('23', 'Reserved for EMVCo', false),
    '24': EMVTagValue.createSimple('24', 'Reserved for EMVCo', false),
    '25': EMVTagValue.createSimple('25', 'Reserved for EMVCo', false),

    // Merchant Account Information (26–51)
    '26': EMVTagValue.createTemplate('26', 'Merchant Account Information', false),
    '27': EMVTagValue.createTemplate('27', 'Merchant Account Information', false),
    '28': EMVTagValue.createTemplate('28', 'Merchant Account Information', false),
    '29': EMVTagValue.createTemplate('29', 'Merchant Account Information', false),
    '30': EMVTagValue.createTemplate('30', 'Merchant Account Information', false),
    '31': EMVTagValue.createTemplate('31', 'Merchant Account Information', false),
    '32': EMVTagValue.createTemplate('32', 'Merchant Account Information', false),
    '33': EMVTagValue.createTemplate('33', 'Merchant Account Information', false),
    '34': EMVTagValue.createTemplate('34', 'Merchant Account Information', false),
    '35': EMVTagValue.createTemplate('35', 'Merchant Account Information', false),
    '36': EMVTagValue.createTemplate('36', 'Merchant Account Information', false),
    '37': EMVTagValue.createTemplate('37', 'Merchant Account Information', false),
    '38': EMVTagValue.createTemplate('38', 'Merchant Account Information', false),
    '39': EMVTagValue.createTemplate('39', 'Merchant Account Information', false),
    '40': EMVTagValue.createTemplate('40', 'Merchant Account Information', false),
    '41': EMVTagValue.createTemplate('41', 'Merchant Account Information', false),
    '42': EMVTagValue.createTemplate('42', 'Merchant Account Information', false),
    '43': EMVTagValue.createTemplate('43', 'Merchant Account Information', false),
    '44': EMVTagValue.createTemplate('44', 'Merchant Account Information', false),
    '45': EMVTagValue.createTemplate('45', 'Merchant Account Information', false),
    '46': EMVTagValue.createTemplate('46', 'Merchant Account Information', false),
    '47': EMVTagValue.createTemplate('47', 'Merchant Account Information', false),
    '48': EMVTagValue.createTemplate('48', 'Merchant Account Information', false),
    '49': EMVTagValue.createTemplate('49', 'Merchant Account Information', false),
    '50': EMVTagValue.createTemplate('50', 'Merchant Account Information', false),
    '51': EMVTagValue.createTemplate('51', 'Merchant Account Information', false),

    // EMVCo Data Objects
    '52': EMVTagValue.createSimple('52', 'Merchant Category Code', true, 4),
    '53': EMVTagValue.createSimple('53', 'Transaction Currency', true, 3),
    '54': EMVTagValue.createSimple('54', 'Transaction Amount', false, 13),
    '55': EMVTagValue.createSimple('55', 'Tip or Convenience Indicator', false, 2),
    '56': EMVTagValue.createSimple('56', 'Value of Convenience Fee Fixed', false, 13),
    '57': EMVTagValue.createSimple('57', 'Value of Convenience Fee Percentage', false, 5),
    '58': EMVTagValue.createSimple('58', 'Country Code', true, 2),
    '59': EMVTagValue.createSimple('59', 'Merchant Name', true, 25),
    '60': EMVTagValue.createSimple('60', 'Merchant City', true, 15),
    '61': EMVTagValue.createSimple('61', 'Postal Code', true, 10),
    '62': EMVTagValue.createTemplate('62', 'Additional Data Field Template', false),
    '63': EMVTagValue.createSimple('63', 'CRC (Cyclic Redundancy Check)', true, 4),
    '64': EMVTagValue.createTemplate('64', 'Merchant Information – Language Template', false),

    // Reserved for EMVCo (65–79)
    '65': EMVTagValue.createSimple('65', 'Reserved for EMVCo', false),
    '66': EMVTagValue.createSimple('66', 'Reserved for EMVCo', false),
    '67': EMVTagValue.createSimple('67', 'Reserved for EMVCo', false),
    '68': EMVTagValue.createSimple('68', 'Reserved for EMVCo', false),
    '69': EMVTagValue.createSimple('69', 'Reserved for EMVCo', false),
    '70': EMVTagValue.createSimple('70', 'Reserved for EMVCo', false),
    '71': EMVTagValue.createSimple('71', 'Reserved for EMVCo', false),
    '72': EMVTagValue.createSimple('72', 'Reserved for EMVCo', false),
    '73': EMVTagValue.createSimple('73', 'Reserved for EMVCo', false),
    '74': EMVTagValue.createSimple('74', 'Reserved for EMVCo', false),
    '75': EMVTagValue.createSimple('75', 'Reserved for EMVCo', false),
    '76': EMVTagValue.createSimple('76', 'Reserved for EMVCo', false),
    '77': EMVTagValue.createSimple('77', 'Reserved for EMVCo', false),
    '78': EMVTagValue.createSimple('78', 'Reserved for EMVCo', false),
    '79': EMVTagValue.createSimple('79', 'Reserved for EMVCo', false),

    // Proprietary / National (80–99)
    '80': EMVTagValue.createTemplate('80', 'Channel', true),
    '81': EMVTagValue.createTemplate('81', 'IVA Condition', true),
    '82': EMVTagValue.createTemplate('82', 'IVA Amount or Percentage', true),
    '83': EMVTagValue.createTemplate('83', 'Base IVA', true),
    '84': EMVTagValue.createTemplate('84', 'INC Condition', true),
    '85': EMVTagValue.createTemplate('85', 'INC Value or Percentage', true),
    '86': EMVTagValue.createTemplate('86', 'Reserved for Taxes', false),
    '87': EMVTagValue.createTemplate('87', 'Reserved for Taxes', false),
    '88': EMVTagValue.createTemplate('88', 'Reserved for Taxes', false),
    '89': EMVTagValue.createTemplate('89', 'Reserved for Taxes', false),
    '90': EMVTagValue.createTemplate('90', 'Transaction Identifier', true, 35 ),
    '91': EMVTagValue.createTemplate('91', 'Security HASH (SHA-256)', true),
    '92': EMVTagValue.createTemplate('92', 'Service Code for collecting/recharging', false),
    '93': EMVTagValue.createTemplate('93', 'Reference for collecting or Mobile', false),
    '94': EMVTagValue.createTemplate('94', 'Product Type for Recaudo', false),
    '95': EMVTagValue.createTemplate('95', 'Origin Account (Transfer)', false),
    '96': EMVTagValue.createTemplate('96', 'Destination Account (Transfer)', false),
    '97': EMVTagValue.createTemplate('97', 'Additional Ref. Destination Account', false),
    '98': EMVTagValue.createTemplate('98', 'Product Type for Transfer', false),
    '99': EMVTagValue.createTemplate('99', 'Discount Application', false),
  } as const;

  static getTag(tag: EMVTag): EMVTagValue | undefined {
    return this.TAGS[tag];
  }

  static getAllTags(): Record<EMVTag, EMVTagValue> {
    return this.TAGS;
  }

  static isValidTag(tag: string): tag is EMVTag {
    return tag in this.TAGS;
  }
}