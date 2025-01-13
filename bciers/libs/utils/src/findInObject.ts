export const findPathsWithNegativeNumbers = (
  obj: any,
  parentPath: string = "",
): string[] => {
  let result: string[] = [];

  //  Depth first traversal through obj paths
  for (const key in obj) {
    const currPath = parentPath ? `${parentPath}.${key}` : key; //  Attach key to current path
    const value = obj[key];

    //  Add full path if number and is negative, otherwise if there's another
    if (typeof value === "number" && value < 0) result.push(currPath);
    else if (typeof value === "object" && value)
      result = result.concat(findPathsWithNegativeNumbers(value, currPath));
  }

  return result;
};
