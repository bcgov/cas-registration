import { screen } from "@testing-library/react";
import { expect } from "vitest";

/**
 * Assert that a radio option exists under the given accessible name.
 *
 * Uses toBeInTheDocument rather than toBeVisible on purpose: MUI renders the
 * real <input type="radio"> visually hidden (PrivateSwitchBase-input, zero
 * opacity) behind the painted SVG control, so toBeVisible always fails on it;
 * assert toBeVisible on the option's label if you also need to prove the user
 * can see it.
 */
export const expectRadio = (label: RegExp) => {
  const radio = screen.getByRole("radio", { name: label });
  expect(radio).toBeInTheDocument();
};

export default expectRadio;
