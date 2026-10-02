/**
 * Comparator to sort string arrays alphabetically.
 */
export const sortAlphabetically = (a: string, b: string) => a.localeCompare(b);

/**
 * Asserts that an object's keys exactly match an expected list of keys.
 */
export function expectExactKeys<T extends string>(
  actualObject: Partial<Record<T, any>>,
  expectedKeys: readonly T[],
) {
  const actualKeys = Object.keys(actualObject).sort(sortAlphabetically);
  const targetKeys = [...expectedKeys].sort(sortAlphabetically);

  expect(actualKeys).toHaveLength(expectedKeys.length);
  expect(actualKeys).toEqual(targetKeys);
}
