// Astroprisma-style oracle tables (see Journal ORACLE).
export const ORACLE_CATEGORIES = [
  'No, and...',
  'No',
  'No, but...',
  'Yes, but...',
  'Yes',
  'Yes, and...'
];

export const ORACLE_WORDS: string[][] = [
  ['Void', 'Treason', 'Chaos', 'Pain', 'Corruption', 'Oppression'], // 01 No, and...
  ['Suspicion', 'Regression', 'Collision', 'Desire', 'Vengeance', 'Occult'], // 02 No
  ['Survival', 'Sacrifice', 'Conflict', 'Control', 'Electricity', 'Subversion'], // 03 No, but...
  ['Nurturing', 'Light', 'Noise', 'Healing', 'Velocity', 'Freedom'], // 04 Yes, but...
  ['Compromise', 'Prophecy', 'Evolution', 'Guidance', 'Growth', 'Nature'], // 05 Yes
  ['Balance', 'Wealth', 'Change', 'Order', 'Truth', 'Time'] // 06 Yes, and...
];

function d6(): number {
  return Math.floor(Math.random() * 6);
}

/** Yes/No oracle: a single d6 across the six-step spectrum. */
export function oracleYesNo(): string {
  const c = d6();
  return `oracle (Yes/No): ${ORACLE_CATEGORIES[c]}`;
}

/** Open-ended oracle: d6 for the category, d6 for the themed word (word only). */
export function oracleOpen(): string {
  const c = d6();
  const w = d6();
  return `oracle (Open): ${ORACLE_WORDS[c][w]}`;
}
