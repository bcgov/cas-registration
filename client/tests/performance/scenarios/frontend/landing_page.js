import { check } from "k6";
import { browser } from "k6/experimental/browser";

const HOST = __ENV.APP_HOST;

const landingPage = async () => {
  const page = browser.newPage();

  try {
    await page.goto(HOST);

    check(page, {
      header: (p) =>
        p.locator(
          '//h2[text()="How to apply for a B.C.OBPS Regulated Operation ID"]',
        ),
    });
  } finally {
    page.close();
  }
};

export default landingPage;
