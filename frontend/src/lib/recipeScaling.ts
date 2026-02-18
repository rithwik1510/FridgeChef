/**
 * Recipe ingredient scaling utility.
 * Parses ingredient amounts like "2 cups", "1/2 tsp", "200g" and scales by ratio.
 */

// Match a leading number (integer, decimal, or fraction) in a string
const AMOUNT_REGEX = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+\.?\d*)/;

function parseFraction(str: string): number {
  str = str.trim();

  // Mixed number: "1 1/2"
  const mixedMatch = str.match(/^(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  }

  // Fraction: "1/2"
  const fracMatch = str.match(/^(\d+)\/(\d+)/);
  if (fracMatch) {
    return parseInt(fracMatch[1]) / parseInt(fracMatch[2]);
  }

  // Decimal or integer
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function formatAmount(value: number): string {
  if (value === 0) return '0';

  // Common fractions for cooking
  const fractions: [number, string][] = [
    [0.125, '1/8'],
    [0.25, '1/4'],
    [0.333, '1/3'],
    [0.375, '3/8'],
    [0.5, '1/2'],
    [0.667, '2/3'],
    [0.75, '3/4'],
  ];

  const whole = Math.floor(value);
  const remainder = value - whole;

  // Check if remainder is close to a common fraction
  for (const [frac, str] of fractions) {
    if (Math.abs(remainder - frac) < 0.04) {
      return whole > 0 ? `${whole} ${str}` : str;
    }
  }

  // If it's close to a whole number
  if (remainder < 0.04) return `${whole}`;
  if (remainder > 0.96) return `${whole + 1}`;

  // Otherwise use one decimal place
  return value.toFixed(1).replace(/\.0$/, '');
}

export function scaleIngredientAmount(amount: string, ratio: number): string {
  if (!amount || ratio === 1) return amount;

  const match = amount.match(AMOUNT_REGEX);
  if (!match) return amount; // No numeric part found, return as-is

  const originalNum = parseFraction(match[1]);
  if (originalNum === 0) return amount;

  const scaled = originalNum * ratio;
  const formattedNum = formatAmount(scaled);
  const rest = amount.slice(match[0].length);

  return `${formattedNum}${rest}`;
}
