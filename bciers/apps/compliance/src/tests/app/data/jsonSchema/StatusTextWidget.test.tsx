import { render, screen } from "@testing-library/react";
import { StatusTextWidget } from "@/compliance/src/app/data/jsonSchema/StatusTextWidget";
import { IssuanceStatus } from "@bciers/utils/src/enums";

describe("StatusTextWidget", () => {
  const statusTestCases = [
    {
      status: IssuanceStatus.APPROVED,
      expectedText: "Approved, credits issued in BCCR",
    },
    {
      status: IssuanceStatus.DECLINED,
      expectedText: "Declined, credits not issued in BCCR",
    },
    {
      status: IssuanceStatus.CHANGES_REQUIRED,
      expectedText: "Changes required",
    },
    {
      status: IssuanceStatus.CREDITS_NOT_ISSUED,
      expectedText: "Declined, credits not issued in BCCR",
    },
    {
      status: IssuanceStatus.ISSUANCE_REQUESTED,
      expectedText: "Issuance requested, awaiting approval",
    },
  ];

  it.each(statusTestCases)(
    "should render '$expectedText' for status '$status'",
    ({ status, expectedText }) => {
      render(<StatusTextWidget value={status} />);
      const element = screen.getByText(expectedText);
      expect(element).toBeVisible();
      expect(element.tagName).toBe("SPAN");
    },
  );

  it("should render empty span for unknown status", () => {
    const { container } = render(<StatusTextWidget value="UNKNOWN_STATUS" />);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent("");
  });
});
