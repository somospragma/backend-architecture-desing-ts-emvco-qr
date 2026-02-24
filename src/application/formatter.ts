export abstract class Formatter {
 buildQrBody(qrBody: string[], sortedTags: [string, string][]): void {
    for (const [tag, value] of sortedTags) {
      qrBody.push(this.formatTag(tag, value));
    }
  }

 formatTag(tag: string, value: string): string {
    const length = value.length.toString().padStart(2, "0");
    return `${tag}${length}${value}`;
  }

 isValidValue(value: string): boolean {
    return (
      ![undefined, "", null, "N/A"].includes(value) && typeof value === "string"
    );
  }
}
