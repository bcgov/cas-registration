import { check } from "k6";
import { browser } from "k6/experimental/browser";

const HOST = __ENV.APP_HOST;

const operation = async () => {
  const page = browser.newPage();

  try {
    await page.goto(HOST + "/dashboard/operations");

    check(page, {
      header: (p) => p.locator('//button[text()="Add Operation"]'),
    });
  } finally {
    page.close();
  }
};

export default operation;
