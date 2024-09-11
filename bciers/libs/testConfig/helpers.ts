// eslint-disable-next-line import/no-extraneous-dependencies
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
export const fillComboboxWidgetField = async (
  input: any,
  option: string | RegExp,
) => {
  const openDropdownButton = input?.parentElement?.children[1]
    ?.children[0] as HTMLInputElement;
  await userEvent.click(openDropdownButton);
  const dropdownOption = screen.getByText(option);
  await userEvent.click(dropdownOption);
};
