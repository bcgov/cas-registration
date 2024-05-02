import { browser } from "k6/experimental/browser";

const HOST = __ENV.APP_HOST;

const landingPage = async () => {
  const page = browser.newPage();

  try {
    await page.goto(HOST);
  } finally {
    page.close();
  }
};

export default landingPage;
