/* eslint-disable */
import { browser } from "k6/browser";
import { APP_HOST } from "../../setup/constants.js";
import { check } from "https://jslib.k6.io/k6-utils/1.5.0/index.js";

const landingPage = async () => {
  const page = await browser.newPage();
  try {
    await page.goto(APP_HOST);
    await check(page.locator("h1"), {
      header: async (lo) =>
        (await lo.textContent()) ===
        "B.C. Industrial Emissions Reporting System",
    });
  } finally {
    await page.close();
  }
};

export default landingPage;
