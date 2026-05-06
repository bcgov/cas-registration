export const createFormContext = (formData: any) => ({
  ...formData,
  getArrayItem: (path: string, index: number) => {
    const arr = formData?.[path];
    if (!Array.isArray(arr)) return undefined;
    return arr[index];
  },
});
