import { act, render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import SubmitButton from "./SubmitButton";

describe("The SubmitButton component", () => {
  it("renders a button with a spinner when isSubmitting is true", () => {
    render(<SubmitButton isSubmitting={true} />);
    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeVisible();
  });

  it("hides the spinner when isSubmitting is false", () => {
    render(<SubmitButton isSubmitting={false} />);
    const spinner = screen.getByTestId("spinner");
    expect(spinner).not.toBeVisible();
  });

  it("renders a button with children when isSubmitting is false", () => {
    render(<SubmitButton isSubmitting={false}>Submit</SubmitButton>);
    const submitText = screen.getByText("Submit");
    expect(submitText).toBeVisible();
  });

  it("hides the children when isSubmitting is true", () => {
    render(<SubmitButton isSubmitting={true}>Submit</SubmitButton>);
    const submitText = screen.getByText("Submit");
    expect(submitText).not.toBeVisible();
  });

  it("disables the button when isSubmitting is true", () => {
    render(<SubmitButton isSubmitting={true} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("disables the button when disabled is true", () => {
    render(<SubmitButton disabled={true} isSubmitting={false} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("calls the onClick handler when the button is clicked", () => {
    const onClick = vi.fn();
    render(<SubmitButton isSubmitting={false} onClick={onClick} />);
    const button = screen.getByRole("button");
    act(() => {
      button.click();
    });
    expect(onClick).toHaveBeenCalled();
  });
});
