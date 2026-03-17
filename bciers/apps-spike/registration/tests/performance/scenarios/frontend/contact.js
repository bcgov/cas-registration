/* eslint-disable */
import { browser } from "k6/browser";
import { APP_HOST } from "../../setup/constants.js";
import { check } from "k6";

const contact = async () => {
  const page = await browser.newPage();
  try {
    // Contacts grid
    await page.goto(APP_HOST + "/administration/contacts");
    const contactNote = page.locator('[data-testid="note"]');
    check(await contactNote.textContent(), {
      "Contact Note": (text) =>
        text ===
        "Note: View the contacts of your operator, i.e. people who can represent the operator for GGIRCA purposes. Please keep the information up to date here.",
    });
    // Contact details
    await page.goto(
      APP_HOST + "/administration/contacts/3?contacts_title=Bill%20Blue",
    );
    const contactDetailNote = page.locator('[data-testid="note"]');
    check(await contactDetailNote.textContent(), {
      "Contact Detail Note": (text) =>
        text === "Note: View or update information of this contact here.",
    });
  } finally {
    await page.close();
  }
};

export default contact;
