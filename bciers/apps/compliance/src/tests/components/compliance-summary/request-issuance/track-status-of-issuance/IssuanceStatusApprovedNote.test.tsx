import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { IssuanceStatusApprovedNote } from "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusApprovedNote";

vi.mock("@bciers/components/icons/Check", () => ({
  __esModule: true,
  default: (props: any) => (
    <div aria-label="check icon" {...props}>
      Check Icon
    </div>
  ),
}));

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    Paper: vi.fn().mockImplementation(({ className, children }) => (
      <div role="note" className={className}>
        {children}
      </div>
    )),
    Box: vi
      .fn()
      .mockImplementation(({ className, children }) => (
        <div className={className}>{children}</div>
      )),
    Typography: vi
      .fn()
      .mockImplementation(({ className, variant, children }) => (
        <p className={className} data-variant={variant}>
          {children}
        </p>
      )),
    Link: vi
      .fn()
      .mockImplementation(({ href, target, rel, className, children }) => (
        <a href={href} target={target} rel={rel} className={className}>
          {children}
        </a>
      )),
  };
});

describe("IssuanceStatusApprovedNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with correct styling", () => {
    render(<IssuanceStatusApprovedNote />);

    const noteElement = screen.getByRole("note");
    expect(noteElement).toBeVisible();

    expect(noteElement.className).toContain("p-4");
    expect(noteElement.className).toContain("mb-[10px]");
    expect(noteElement.className).toContain("bg-[#DCE9F6]");
    expect(noteElement.className).toContain("text-bc-text");
  });

  it("displays the Check icon", () => {
    render(<IssuanceStatusApprovedNote />);

    const checkIcon = screen.getByLabelText("check icon");
    expect(checkIcon).toBeVisible();
    expect(checkIcon).toHaveAttribute("width", "24");
  });

  it("contains the correct text message", () => {
    render(<IssuanceStatusApprovedNote />);

    expect(screen.getByText(/your request is approved/i)).toBeVisible();
    expect(
      screen.getByText(
        /the earned credits have been issued to your holding account/i,
      ),
    ).toBeVisible();
    expect(screen.getByText(/successfully/i)).toBeVisible();
  });

  it("includes a link to the B.C. Carbon Registry with correct attributes", () => {
    render(<IssuanceStatusApprovedNote />);

    const link = screen.getByRole("link", { name: /b\.c\. carbon registry/i });
    expect(link).toBeVisible();

    expect(link).toHaveAttribute("href", "#");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    expect(link.className).toContain("text-bc-link-blue");
    expect(link.className).toContain("underline");
    expect(link.className).toContain("font-bold");
  });
});
