/* eslint-disable */
import { browser } from "k6/browser";
import { APP_HOST } from "../../setup/constants.js";
import { check } from "k6";

const operation = async () => {
  const page = await browser.newPage();
  try {
    // Operations grid
    await page.goto(APP_HOST + "/administration/operations");
    const operationNote = page.locator('[data-testid="note"]');
    check(await operationNote.textContent(), {
      "Operation Note": (text) =>
        text === "Note: View the operations owned by your operator here.",
    });
    // Operation details
    await page.goto(
      APP_HOST +
        "/administration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d?operations_title=Banana%20LFO%20-%20Registered",
    );
    const operationDetailHeader = page.locator(
      '//h2[contains(text(), "Operation Information")]',
    );
    check(await operationDetailHeader.textContent(), {
      "Operation Detail Header": (text) => text === "Operation Information",
    });
  } finally {
    await page.close();
  }
};

export default operation;
