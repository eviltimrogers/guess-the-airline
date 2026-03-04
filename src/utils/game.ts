export interface Airline {
  iataCode: string;
  name: string;
  id: string;
}

/** Fisher-Yates shuffle algorithm for proper randomization */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomAirlines(
  airlines: Airline[],
  count: number,
  exclude: Airline | null = null,
): Airline[] {
  const available = exclude
    ? airlines.filter((a) => a.id !== exclude.id)
    : airlines;
  return shuffle(available).slice(0, count);
}

export function buildFeedbackText(
  isCorrect: boolean,
  streak: number,
  correctAirlineName: string,
): string {
  if (isCorrect) {
    const comboText = streak > 1 ? ` ${streak}x COMBO!` : '';
    return `CORRECT!${comboText}`;
  }
  return `WRONG! IT WAS ${correctAirlineName.toUpperCase()}`;
}
