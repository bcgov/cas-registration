/* eslint-disable */
import { browser } from "k6/browser";
import { APP_HOST } from "../../setup/constants.js";
import { check } from "k6";

const facility = async () => {
  const page = await browser.newPage();
  try {
    // Facilities grid
    await page.goto(
      APP_HOST +
        "/administration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/facilities?operations_title=Banana+LFO+-+Registered",
    );
    const facilityNote = page.locator('[data-testid="note"]');
    check(await facilityNote.textContent(), {
      "Facility Note": (text) =>
        text === "Note: View the facilities of this operation here.",
    });
    // Facility details
    await page.goto(
      APP_HOST +
        "/administration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/facilities/f486f2fb-62ed-438d-bb3e-0819b51e3aeb?operations_title=Banana%20LFO%20-%20Registered&facilities_title=Facility%201",
    );
    const facilityDetailHeader = page.locator("h2");
    check(await facilityDetailHeader.textContent(), {
      "Facility Detail Header": (text) => text === "Facility Information",
    });
  } finally {
    await page.close();
  }
};

export default facility;
