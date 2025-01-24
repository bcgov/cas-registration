/* eslint-disable import/no-extraneous-dependencies */
import { screen } from "@testing-library/react";

export const expectComboBox = (label: RegExp, expectedValue?: string) => {
  expect(screen.getByLabelText(label)).toBeVisible();
  expect(screen.getByRole("combobox", { name: label })).toBeVisible();

  if (expectedValue) {
    expect(screen.getByLabelText(label)).toHaveValue(expectedValue);
  }
};

export default expectComboBox;
