/* eslint-disable import/no-extraneous-dependencies*/
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

const defaultStyle = "border-color: #e5e5e5";
const errorStyle = "border-color: #d8292f";

export const checkTextWidgetValidationStyles = async (
  component: ReactNode,
  labelText: string,
  invalidValue?: string,
) => {
  render(component);

  const input = screen.getByLabelText(labelText);
  const inputBorderElement = input.parentElement?.querySelector(
    "fieldset",
  ) as Element;

  const submitButton = screen.getByRole("button", { name: "Submit" });

  // The input should have the default border color
  expect(inputBorderElement).toHaveStyle(defaultStyle);

  // Trigger empty field validation
  await userEvent.click(submitButton);

  // The input should have the error border color
  expect(inputBorderElement).toHaveStyle(errorStyle);

  if (invalidValue) {
    await userEvent.type(input, invalidValue);

    // The input should have the default border color since required field is not empty anymore
    // expect(inputBorderElement).toHaveStyle(defaultStyle);
    // Trigger the error
    await userEvent.click(submitButton);

    // The input should have the error border color
    expect(inputBorderElement).toHaveStyle(errorStyle);
  }
};

export const checkComboBoxWidgetValidationStyles = async (
  component: ReactNode,
) => {
  render(component);

  const comboBoxInput = screen.getByRole("combobox") as HTMLInputElement;
  const inputBorderElement =
    comboBoxInput?.parentElement?.querySelector("fieldset");

  const submitButton = screen.getByRole("button", { name: "Submit" });

  // The input should have the default border color
  expect(inputBorderElement).toHaveStyle(defaultStyle);

  // Trigger empty field validation
  await userEvent.click(submitButton);

  // The input should have the error border color
  expect(inputBorderElement).toHaveStyle(errorStyle);
};

export const checkNoValidationErrorIsTriggered = async () => {
  const submitButton = screen.getByRole("button", { name: "Submit" });
  await userEvent.click(submitButton);
  expect(screen.queryByRole("alert")).toBeNull();
};

// MUI X date fields render editable sections (year, month, day); the labelled
// <input> is hidden and only holds the value. Type into the sections instead
export const typeDate = async (dateInput: HTMLElement, value: string) => {
  const sections = dateInput
    .closest('[role="group"]')
    ?.querySelector<HTMLElement>(".MuiPickersSectionList-root");
  if (!sections) throw new Error("Date field sections not found");
  await userEvent.type(sections, value);
};
