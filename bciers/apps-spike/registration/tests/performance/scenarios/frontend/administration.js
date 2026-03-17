/* eslint-disable */
import { browser } from "k6/browser";
import { APP_HOST } from "../../setup/constants.js";
import { check } from "k6";

const administration = async () => {
  const page = await browser.newPage();
  try {
    await page.goto(APP_HOST + "/administration");
    const myOperatorTile = page.locator('[aria-label="My Operator"]');
    check(await myOperatorTile.textContent(), {
      "My Operator": (text) =>
        text === "My OperatorView or update information of your operator here.",
    });
  } finally {
    await page.close();
  }
};

export default administration;
