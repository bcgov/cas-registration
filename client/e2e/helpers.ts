import { execSync } from "child_process";
export const checkboxChecker = async (page: any, ariaLabel: string) => {
  const checkbox = await page.$(`[aria-label="${ariaLabel}"]`);
  if (checkbox) {
    await checkbox.click();
  } else {
    console.error("Checkbox not found");
  }
};

export const loadFixture = (fixture: string) =>
  execSync(`psql -v "ON_ERROR_STOP=1" -d registration<< 'EOF'
${fixture}
EOF`);
