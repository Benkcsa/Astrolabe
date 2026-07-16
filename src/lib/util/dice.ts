// Dice notation parser + roller. Supports forms like: 2d6+2, d20, 3d8-1, 1d6+2d4+3.

export interface DiceResult {
  notation: string;
  total: number;
  rolls: { die: number; values: number[] }[];
  modifier: number;
  ok: boolean;
  error?: string;
}

const TERM = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/gi;

export function rollDice(input: string): DiceResult {
  const notation = input.trim();
  const result: DiceResult = {
    notation,
    total: 0,
    rolls: [],
    modifier: 0,
    ok: false
  };

  if (!notation) {
    result.error = 'Empty roll';
    return result;
  }

  // Validate overall shape (only dice terms, numbers, and +/-).
  const cleaned = notation.replace(/\s+/g, '');
  if (!/^[+-]?(\d*d\d+|\d+)([+-](\d*d\d+|\d+))*$/i.test(cleaned)) {
    result.error = `Invalid notation: ${notation}`;
    return result;
  }

  let match: RegExpExecArray | null;
  TERM.lastIndex = 0;
  while ((match = TERM.exec(cleaned)) !== null) {
    if (match[3]) {
      // dice term
      const sign = match[1] === '-' ? -1 : 1;
      const count = match[2] === '' ? 1 : parseInt(match[2], 10);
      const die = parseInt(match[3], 10);
      if (count > 1000 || die < 1) {
        result.error = 'Roll out of range';
        return result;
      }
      const values: number[] = [];
      for (let i = 0; i < count; i++) {
        const v = 1 + Math.floor(Math.random() * die);
        values.push(v);
        result.total += sign * v;
      }
      result.rolls.push({ die, values: sign === -1 ? values.map((v) => -v) : values });
    } else if (match[5]) {
      // flat modifier
      const sign = match[4] === '-' ? -1 : 1;
      const n = parseInt(match[5], 10) * sign;
      result.modifier += n;
      result.total += n;
    }
  }

  result.ok = true;
  return result;
}

export function formatRoll(r: DiceResult): string {
  if (!r.ok) return r.error ?? 'Invalid roll';
  const parts = r.rolls
    .map((roll) => `d${roll.die}[${roll.values.map((v) => Math.abs(v)).join(', ')}]`)
    .join(' ');
  const mod = r.modifier ? (r.modifier > 0 ? ` +${r.modifier}` : ` ${r.modifier}`) : '';
  return `Roll ${r.notation} = ${r.total}  (${parts}${mod})`;
}
