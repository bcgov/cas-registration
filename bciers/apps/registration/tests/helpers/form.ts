import { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

const defaultStyle = "border-color: rgba(0, 0, 0, 0.23)";
const errorStyle = "border-color: #d8292f";

export const checkTextWidgetValidationStyles = async (
  component: ReactNode,
  labelText: string,
  validationValue?: string,
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

  if (validationValue) {
    await userEvent.type(input, validationValue);

    // The input should have the default border color since required field is not empty anymore
    expect(inputBorderElement).toHaveStyle(defaultStyle);
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
