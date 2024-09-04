/* eslint-disable import/no-extraneous-dependencies */
import { screen } from "@testing-library/react";

export const expectMessage = (testId: string, expectedText: string) => {
  const msg = screen.getByTestId(testId);
  expect(msg).toBeVisible();
  expect(msg).toHaveTextContent(expectedText);
};

export default expectMessage;
