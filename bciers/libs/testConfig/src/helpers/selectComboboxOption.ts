// eslint-disable-next-line import/no-extraneous-dependencies
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const selectComboboxOption = async (
  label: RegExp,
  optionText: string,
) => {
  // Click the combobox to open the options
  await userEvent.click(screen.getByRole("combobox", { name: label }));
  // Find all options and ensure the desired option exists
  const options = screen.getAllByRole("option");
  expect(
    options.some((option) => option.textContent === optionText),
  ).toBeTruthy();

  // Click the desired option
  await userEvent.click(screen.getByText(optionText));

  // Assert the combobox reflects the selected option
  expect(screen.getByRole("combobox", { name: label })).toHaveTextContent(
    optionText,
  );
};
