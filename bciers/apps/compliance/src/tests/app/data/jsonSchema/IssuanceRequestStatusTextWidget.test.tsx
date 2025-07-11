import { render, screen } from "@testing-library/react";
import { IssuanceRequestStatusTextWidget } from "@/compliance/src/app/data/jsonSchema/IssuanceRequestStatusTextWidget";
import { IssuanceStatus } from "@bciers/utils/src/enums";

describe("IssuanceRequestStatusTextWidget", () => {
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
      expectedText: "Issuance not requested",
    },
    {
      status: IssuanceStatus.ISSUANCE_REQUESTED,
      expectedText: "Issuance requested, awaiting approval",
    },
  ];

  it.each(statusTestCases)(
    "should render '$expectedText' for status '$status'",
    ({ status, expectedText }) => {
      render(<IssuanceRequestStatusTextWidget value={status} />);
      const element = screen.getByText(expectedText);
      expect(element).toBeVisible();
      expect(element.tagName).toBe("SPAN");
    },
  );

  it("should render empty span for unknown status", () => {
    const { container } = render(<IssuanceRequestStatusTextWidget value="UNKNOWN_STATUS" />);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent("");
  });
});
