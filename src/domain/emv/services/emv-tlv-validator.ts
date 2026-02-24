import { EMVTLVService, TLVNode } from "./emv-tlv-service";
import { EMVTagRegistry } from "./emv-tag-registry";
import { EMVTag } from "../value-objects/emv-tag";
import { CRCService } from "../../crypto/services/crc-service";

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class EMVTLVValidator {
  static validate(tlvString: string): ValidationResult {
    const errors: string[] = [];

    try {
      const nodes = EMVTLVService.parse(tlvString);
      const tagMap = new Map(nodes.map((n) => [n.tag, n]));

      this.validateStructure(nodes, errors);
      this.validateOrder(nodes, errors);
      this.validateRequiredTags(tagMap, errors);
      this.validateTagRules(nodes, errors);
      this.validateConditionalRules(tagMap, errors);
      this.validateCRC(tlvString, errors);
    } catch (error) {
      errors.push(
        `Parse error: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static validateStructure(nodes: TLVNode[], errors: string[]): void {
    for (const node of nodes) {
      if (node.length > 99) {
        errors.push(
          `Tag ${node.tag}: Length ${node.length} exceeds maximum of 99`
        );
      }

      const actualLength = node.value?.length || 0;
      if (node.value && actualLength !== node.length) {
        errors.push(
          `Tag ${node.tag}: Length mismatch (declared: ${node.length}, actual: ${actualLength})`
        );
      }

      if (node.subtags) {
        for (const subtag of node.subtags) {
          if (subtag.length > 99) {
            errors.push(
              `Tag ${node.tag} Subtag ${subtag.tag}: Length ${subtag.length} exceeds maximum of 99`
            );
          }
        }
      }
    }
  }

  private static validateOrder(nodes: TLVNode[], errors: string[]): void {
    if (nodes.length === 0) return;

    if (nodes[0].tag !== "00") {
      errors.push("Tag 00 (Payload Format Indicator) must be first");
    }

    if (nodes.at(-1)?.tag !== "63") {
      errors.push("Tag 63 (CRC) must be last");
    }
  }

  private static validateRequiredTags(
    tagMap: Map<string, any>,
    errors: string[]
  ): void {
    const allTags = EMVTagRegistry.getAllTags();

    for (const [tag, tagValue] of Object.entries(allTags)) {
      if (tagValue.required && !tagMap.has(tag)) {
        errors.push(`Required tag ${tag} (${tagValue.description}) is missing`);
      }
    }
  }

  private static validateTagRules(nodes: TLVNode[], errors: string[]): void {
    for (const node of nodes) {
      this.validateSingleTag(node, errors);
    }
  }

  private static validateSingleTag(node: TLVNode, errors: string[]): void {
    const tagDef = EMVTagRegistry.getTag(node.tag as EMVTag);
    if (!tagDef) {
      errors.push(`Tag ${node.tag}: Unknown tag`);
      return;
    }

    this.validateTagLength(node, tagDef, errors);
    this.validateSpecialTags(node, errors);
    this.validateTemplate(node, tagDef, errors);
  }

  private static validateTagLength(
    node: any,
    tagDef: any,
    errors: string[]
  ): void {
    const valueLength = node.value?.length || 0;
    if (tagDef.maxLength && valueLength > tagDef.maxLength) {
      errors.push(
        `Tag ${node.tag}: Value length ${valueLength} exceeds maximum ${tagDef.maxLength}`
      );
    }
  }

  private static validateSpecialTags(node: TLVNode, errors: string[]): void {
    if (node.tag === "00" && node.value !== "01") {
      errors.push(`Tag 00: Must be '01', got '${node.value}'`);
    }

    if (node.tag === "01" && !["11", "12"].includes(node.value || "")) {
      errors.push(`Tag 01: Must be '11' or '12', got '${node.value}'`);
    }
  }

  private static validateTemplate(
    node: TLVNode,
    tagDef: any,
    errors: string[]
  ): void {
    if (tagDef.type === "template" && !node.subtags) {
      errors.push(`Tag ${node.tag}: Must be a template with subtags`);
      return;
    }

    if (node.subtags) {
      const hasGUI = node.subtags.some((st: any) => st.tag === "00");
      if (!hasGUI) {
        errors.push(`Tag ${node.tag}: Template must have subtag 00 (GUI)`);
      }
    }
  }

  private static validateConditionalRules(
    tagMap: Map<string, any>,
    errors: string[]
  ): void {
    const tipIndicator = tagMap.get("55")?.value;

    if (tipIndicator === "02" && !tagMap.has("56")) {
      errors.push("Tag 56 (Tip Amount) required when Tag 55 = '02'");
    }

    if (tipIndicator === "03" && !tagMap.has("57")) {
      errors.push("Tag 57 (Tip Percentage) required when Tag 55 = '03'");
    }

    if (tipIndicator && !["01", "02", "03"].includes(tipIndicator)) {
      errors.push("Tag 55 (Tip Indicator) must be '01', '02', or '03'");
    }

    this.validateTaxCoherence(tagMap, errors, "81", "82", "VAT");
    this.validateTaxCoherence(tagMap, errors, "84", "85", "INC");
  }

  private static validateTaxCoherence(
    tagMap: Map<string, any>,
    errors: string[],
    conditionTag: string,
    valueTag: string,
    taxName: string
  ): void {
    const conditionNode = tagMap.get(conditionTag);
    const valueNode = tagMap.get(valueTag);

    if (!conditionNode?.subtags || !valueNode?.subtags) return;

    const conditionSubtag = conditionNode.subtags.find((st: any) => st.tag === "01");
    const valueSubtag = valueNode.subtags.find((st: any) => st.tag === "01");

    if (!conditionSubtag?.value || !valueSubtag?.value) return;

    const condition = conditionSubtag.value;
    const value = valueSubtag.value;

    if (!["01", "02", "03"].includes(condition)) {
      errors.push(`Tag ${conditionTag}: ${taxName} condition must be '01', '02', or '03', got '${condition}'`);
    }

    if (condition === "01" && value !== "0") {
      errors.push(`Tag ${valueTag}: ${taxName} value must be '0' when condition is '01' (exempt), got '${value}'`);
    }
  }

  private static validateCRC(tlvString: string, errors: string[]): void {
    const crcIndex = tlvString.lastIndexOf("6304");
    if (crcIndex === -1) {
      errors.push("CRC tag (63) not found");
      return;
    }

    const isValidCalculatedCRC = CRCService.validateCRC16(tlvString);

    if (!isValidCalculatedCRC) {
      errors.push(`Invalid CRC`);
    }
  }
}
