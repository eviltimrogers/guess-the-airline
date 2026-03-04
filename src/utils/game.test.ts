import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shuffle, getRandomAirlines, buildFeedbackText, type Airline } from './game';

const mockAirlines: Airline[] = [
  { id: '1', iataCode: 'AA', name: 'American Airlines' },
  { id: '2', iataCode: 'BA', name: 'British Airways' },
  { id: '3', iataCode: 'DL', name: 'Delta Air Lines' },
  { id: '4', iataCode: 'UA', name: 'United Airlines' },
  { id: '5', iataCode: 'LH', name: 'Lufthansa' },
];

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    expect(shuffle(mockAirlines)).toHaveLength(mockAirlines.length);
  });

  it('contains all the same elements as the original', () => {
    const shuffled = shuffle(mockAirlines);
    expect(shuffled).toEqual(expect.arrayContaining(mockAirlines));
    expect(mockAirlines).toEqual(expect.arrayContaining(shuffled));
  });

  it('does not mutate the original array', () => {
    const original = [...mockAirlines];
    shuffle(mockAirlines);
    expect(mockAirlines).toEqual(original);
  });

  it('returns a new array instance', () => {
    expect(shuffle(mockAirlines)).not.toBe(mockAirlines);
  });

  it('handles an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    expect(shuffle([mockAirlines[0]])).toEqual([mockAirlines[0]]);
  });

  it('works with non-object arrays', () => {
    const nums = [1, 2, 3, 4, 5];
    const shuffled = shuffle(nums);
    expect(shuffled).toHaveLength(5);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('produces different orderings over multiple calls', () => {
    // With 5! = 120 possible orderings, getting the same order 20 times in a row
    // has probability (1/120)^19 ≈ 1e-39, effectively zero
    const original = JSON.stringify(mockAirlines);
    const allSame = Array.from({ length: 20 }, () =>
      JSON.stringify(shuffle(mockAirlines)),
    ).every((r) => r === original);
    expect(allSame).toBe(false);
  });
});

describe('getRandomAirlines', () => {
  it('returns the requested number of airlines', () => {
    expect(getRandomAirlines(mockAirlines, 3)).toHaveLength(3);
  });

  it('returns all airlines when count equals list length', () => {
    expect(getRandomAirlines(mockAirlines, 5)).toHaveLength(5);
  });

  it('excludes the specified airline', () => {
    const excluded = mockAirlines[0];
    const result = getRandomAirlines(mockAirlines, 3, excluded);
    expect(result.find((a) => a.id === excluded.id)).toBeUndefined();
  });

  it('does not exclude anything when exclude is null', () => {
    // Run multiple times: the excluded airline should appear at some point
    const allResults = Array.from({ length: 20 }, () =>
      getRandomAirlines(mockAirlines, 1, null),
    ).flat();
    expect(allResults.some((a) => a.id === mockAirlines[0].id)).toBe(true);
  });

  it('returns only airlines from the provided list', () => {
    const result = getRandomAirlines(mockAirlines, 3);
    result.forEach((airline) => {
      expect(mockAirlines).toContainEqual(airline);
    });
  });

  it('returns unique airlines with no duplicates', () => {
    const result = getRandomAirlines(mockAirlines, 4);
    const ids = result.map((a) => a.id);
    expect(new Set(ids).size).toBe(4);
  });

  it('handles count of 1', () => {
    const result = getRandomAirlines(mockAirlines, 1);
    expect(result).toHaveLength(1);
    expect(mockAirlines).toContainEqual(result[0]);
  });

  it('returns an empty array when count is 0', () => {
    expect(getRandomAirlines(mockAirlines, 0)).toEqual([]);
  });

  it('accounts for the excluded airline when counting', () => {
    // With 5 airlines and 1 excluded, we can get at most 4
    const excluded = mockAirlines[0];
    const result = getRandomAirlines(mockAirlines, 4, excluded);
    expect(result).toHaveLength(4);
    expect(result.find((a) => a.id === excluded.id)).toBeUndefined();
  });
});

describe('buildFeedbackText', () => {
  it('returns "CORRECT!" for a correct answer with streak of 1', () => {
    expect(buildFeedbackText(true, 1, 'American Airlines')).toBe('CORRECT!');
  });

  it('returns "CORRECT!" for a correct answer with streak of 0', () => {
    expect(buildFeedbackText(true, 0, 'American Airlines')).toBe('CORRECT!');
  });

  it('includes combo text for streak > 1', () => {
    expect(buildFeedbackText(true, 2, 'American Airlines')).toBe(
      'CORRECT! 2x COMBO!',
    );
  });

  it('includes higher combo counts correctly', () => {
    expect(buildFeedbackText(true, 10, 'American Airlines')).toBe(
      'CORRECT! 10x COMBO!',
    );
  });

  it('returns wrong text with the correct airline name in uppercase', () => {
    expect(buildFeedbackText(false, 0, 'American Airlines')).toBe(
      'WRONG! IT WAS AMERICAN AIRLINES',
    );
  });

  it('uppercases airline names that are already mixed case', () => {
    expect(buildFeedbackText(false, 0, 'Lufthansa')).toBe(
      'WRONG! IT WAS LUFTHANSA',
    );
  });

  it('uppercases airline names that are entirely lowercase', () => {
    expect(buildFeedbackText(false, 0, 'british airways')).toBe(
      'WRONG! IT WAS BRITISH AIRWAYS',
    );
  });

  it('ignores streak value for incorrect answers', () => {
    expect(buildFeedbackText(false, 5, 'Delta Air Lines')).toBe(
      'WRONG! IT WAS DELTA AIR LINES',
    );
  });
});
