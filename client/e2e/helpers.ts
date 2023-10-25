export const checkboxChecker = async (page: any, ariaLabel: string) => {
  const checkbox = await page.$(`[aria-label="${ariaLabel}"]`);
  if (checkbox) {
    await checkbox.click();
  } else {
    console.error("Checkbox not found");
  }
};
