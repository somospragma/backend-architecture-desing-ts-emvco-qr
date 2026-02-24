export interface ErrorCorrectionLevel {
  bit: number;
}

export const L: ErrorCorrectionLevel = { bit: 1 };
export const M: ErrorCorrectionLevel = { bit: 0 };
export const Q: ErrorCorrectionLevel = { bit: 3 };
export const H: ErrorCorrectionLevel = { bit: 2 };

function fromString(string: string): ErrorCorrectionLevel {
  if (typeof string !== "string") {
    throw new TypeError("Param is not a string");
  }

  const lcStr = string.toLowerCase();

  switch (lcStr) {
    case "l":
    case "low":
      return L;

    case "m":
    case "medium":
      return M;

    case "q":
    case "quartile":
      return Q;

    case "h":
    case "high":
      return H;

    default:
      throw new Error("Unknown EC Level: " + string);
  }
}

export function isValid(level: any): level is ErrorCorrectionLevel {
  return (
    level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4
  );
}

export function from(
  value: any,
  defaultValue: ErrorCorrectionLevel
): ErrorCorrectionLevel {
  if (isValid(value)) {
    return value;
  }

  try {
    return fromString(value);
  } catch (e) {
    return defaultValue;
  }
}
