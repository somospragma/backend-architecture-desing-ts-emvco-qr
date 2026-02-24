import { EMVQRCodeContent } from "../domain/emv/entities/emv-qr-code";
import { EMVTag } from "../domain/emv/value-objects/emv-tag";
import { EMVTagRegistry } from "../domain/emv/services/emv-tag-registry";
import { CRCService } from "../domain/crypto/services/crc-service";
import { Formatter } from "./formatter";

export class EMVCoContentBuilder extends Formatter {
  private readonly qrCode = new EMVQRCodeContent();

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
