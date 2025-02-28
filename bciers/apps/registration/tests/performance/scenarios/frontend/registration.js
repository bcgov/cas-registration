/* eslint-disable */
import { browser } from "k6/browser";
import { APP_HOST } from "../../setup/constants.js";
import { check } from "k6";

const registration = async () => {
  const page = await browser.newPage();
  try {
    await page.goto(APP_HOST + "/registration/register-an-operation");
    const registrationHeader = page.locator(
      '[data-testid="field-template-label"]',
    );
    check(await registrationHeader.textContent(), {
      "Registration Header": (text) => text === "Operation Information",
    });
  } finally {
    await page.close();
  }
};

export default registration;
