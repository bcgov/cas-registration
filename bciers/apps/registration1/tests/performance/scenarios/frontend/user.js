import { browser } from "k6/experimental/browser";

const HOST = __ENV.APP_HOST;

const user = async () => {
  const page = browser.newPage();

  try {
    await page.goto(HOST + "/dashboard/profile");
    await page.goto(HOST + "/dashboard/users");
  } finally {
    page.close();
  }
};

export default user;
