// Stand-in dictionary type for ts
// Will be the right type for "any" in most places

export type Dict = {
  [key: string]: Dict;
};
