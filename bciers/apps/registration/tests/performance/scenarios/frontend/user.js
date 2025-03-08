/* eslint-disable */
import { browser } from "k6/browser";
import { APP_HOST } from "../../setup/constants.js";
import { check } from "k6";

const user = async () => {
  const page = await browser.newPage();
  try {
    await page.goto(APP_HOST + "/administration/profile");
    const profileHeader = page.locator(
      '//div[contains(text(), "Please update or verify your information")]',
    );
    check(await profileHeader.textContent(), {
      "Profile Header": (text) =>
        text === "Please update or verify your information",
    });
  } finally {
    await page.close();
  }
};

export default user;
