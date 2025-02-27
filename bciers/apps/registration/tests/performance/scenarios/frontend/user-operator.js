/* eslint-disable */
import { browser } from "k6/browser";
import { APP_HOST } from "../../setup/constants.js";
import { check } from "k6";

const userOperator = async () => {
  const page = await browser.newPage();
  try {
    await page.goto(APP_HOST + "/administration/users-and-access-requests");
    const usersAndAccessRequestsHeader = page.locator(
      '//h2[contains(text(), "Users and Access Requests")]',
    );
    check(await usersAndAccessRequestsHeader.textContent(), {
      "Users and Access Requests Header": (text) =>
        text === "Users and Access Requests",
    });
  } finally {
    await page.close();
  }
};

export default userOperator;
