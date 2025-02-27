/* eslint-disable */
import { browser } from "k6/browser";
import { APP_HOST } from "../../setup/constants.js";
import { check } from "k6";

const operator = async () => {
  const page = await browser.newPage();
  try {
    await page.goto(APP_HOST + "/administration/my-operator");
    const operationDetailHeader = page.locator(
      '//h2[contains(text(), "Operator Information")]',
    );
    check(await operationDetailHeader.textContent(), {
      "Operator Detail Header": (text) => text === "Operator Information",
    });
  } finally {
    await page.close();
  }
};

export default operator;
