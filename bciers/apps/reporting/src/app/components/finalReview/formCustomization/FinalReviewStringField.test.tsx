import { render, screen } from "@testing-library/react";
import FinalReviewStringField from "./FinalReviewStringField";
import { describe, it, expect } from "vitest";

describe("FinalReviewStringField", () => {
  it("renders a number with decimals and thousand separators when schema type is number", () => {
    const numberProps = {
      schema: { type: "number" },
      formData: "123123.4567",
    };
    render(<FinalReviewStringField {...numberProps} />);
    expect(screen.getByDisplayValue("123,123.4567")).toBeVisible();
  });

  it("renders a string schema when type is not number", () => {
    const textProps = {
      schema: { type: "string" },
      formData: "Test String",
    };
    render(<FinalReviewStringField {...textProps} />);
    expect(screen.getByText("Test String")).toBeVisible();
  });

  it("renders nothing (instead of NaN) when type is number but there is no value", () => {
    const textProps = {
      schema: { type: "number" },
    };
    render(<FinalReviewStringField {...textProps} />);
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.queryByText("NaN")).not.toBeInTheDocument();
  });
});
