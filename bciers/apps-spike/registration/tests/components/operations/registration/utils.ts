/* eslint import/no-extraneous-dependencies: ["error", { "devDependencies": true }] */

import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "vitest";

// Facility form utils
export const toggleAndFillStartDate = async (index: number, date: string) => {
  const facilityToggle = screen.getAllByLabelText(
    /Did this facility begin operations in+/i,
  )[index];
  expect(facilityToggle).not.toBeChecked();

  act(() => {
    fireEvent.click(facilityToggle);
  });

  expect(facilityToggle).toBeChecked();
  const facilityStartDate = screen.getAllByLabelText(
    /Date of facility starting operations+/i,
  )[index];

  await userEvent.type(facilityStartDate, date);
};

export const fillAddressFields = (index: number) => {
  fireEvent.change(screen.getAllByLabelText(/Street Address/i)[index], {
    target: { value: "123 Test St" },
  });
  fireEvent.change(screen.getAllByLabelText(/Municipality/i)[index], {
    target: { value: "Test City" },
  });
  fireEvent.change(screen.getAllByLabelText(/Postal Code/i)[index], {
    target: { value: "V8X3K1" },
  });
};

export const fillNameAndTypeFields = (index: number) => {
  fireEvent.change(screen.getAllByLabelText(/Facility Name*/i)[index], {
    target: { value: "Test Facility" },
  });
  const comboBoxInput = screen.getAllByLabelText(/Facility Type*/i)[index];
  fireEvent.mouseDown(comboBoxInput);
  const comboBoxOption = screen.getByText("Large Facility");
  fireEvent.click(comboBoxOption);
};

export const fillLatitudeLongitudeFields = (index: number) => {
  fireEvent.change(
    screen.getAllByLabelText(/Latitude of Largest Point of Emissions+/i)[index],
    { target: { value: 0.1 } },
  );
  fireEvent.change(
    screen.getAllByLabelText(/Longitude of Largest Point of Emissions+/i)[
      index
    ],
    { target: { value: 0.1 } },
  );
};
