import { EMVTag } from '../value-objects/emv-tag';

export class EMVQRCodeContent {
  private readonly fields = new Map<EMVTag, string>();
  private readonly templates = new Map<string, Map<string, string>>();

  setField(tag: EMVTag, value: string): void {
    this.fields.set(tag, value);
  }

  setSubField(templateTag: EMVTag, subTag: string, value: string): void {
    if (!this.templates.has(templateTag)) {
      this.templates.set(templateTag, new Map());
    }
    this.templates.get(templateTag)!.set(subTag, value);
  }

  getField(tag: EMVTag): string | undefined {
    return this.fields.get(tag);
  }

  getSubField(templateTag: EMVTag, subTag: string): string | undefined {
    return this.templates.get(templateTag)?.get(subTag);
  }

  getAllFields(): Map<EMVTag, string> {
    return new Map(this.fields);
  }

  getAllTemplates(): Map<string, Map<string, string>> {
    return new Map(this.templates);
  }

  clear(): void {
    this.fields.clear();
    this.templates.clear();
  }
}