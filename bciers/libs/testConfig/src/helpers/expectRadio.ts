/* eslint-disable import/no-extraneous-dependencies */
import { screen } from "@testing-library/react";
import { expect } from "vitest";

export const expectRadio = (label: RegExp) => {
  const radio = screen.getByRole("radio", { name: label });
  expect(radio).toBeInTheDocument(); // Verify that the radio button is visible
};

export default expectRadio;
