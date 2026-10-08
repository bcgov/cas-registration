// compares GUIDs, ignoring case and hyphens
export const compareGuids = (guid1: string, guid2: string): boolean => {
  return normalizeGuid(guid1) === normalizeGuid(guid2);
};

const normalizeGuid = (guid: string): string => {
  return guid.trim().replace(/-/g, "").toLowerCase();
};
