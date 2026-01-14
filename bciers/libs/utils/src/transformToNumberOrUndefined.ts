const transformToNumberOrUndefined = (value: unknown): number | undefined => {
  if (typeof value === "number" && !isNaN(value)) return value;
  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    !isNaN(Number(value))
  ) {
    return Number(value);
  }
  return undefined;
};

export default transformToNumberOrUndefined;
