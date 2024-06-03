import { browser } from "k6/experimental/browser";

const HOST = __ENV.APP_HOST;

const operation = async () => {
  const page = browser.newPage();

  try {
    await page.goto(HOST + "/dashboard/operations");
    await page.goto(HOST + "/dashboard/operations/2/1");
    await page.goto(HOST + "/dashboard/operations/2/2");
  } finally {
    page.close();
  }
};

export default operation;
