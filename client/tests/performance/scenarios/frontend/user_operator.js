import { browser } from "k6/experimental/browser";

const HOST = __ENV.APP_HOST;

const userOperator = async () => {
  const page = browser.newPage();

  try {
    await page.goto(HOST + "/dashboard/select-operator/user-operator/2/1");
    await page.goto(HOST + "/dashboard/select-operator/user-operator/2/2");
  } finally {
    page.close();
  }
};

export default userOperator;
