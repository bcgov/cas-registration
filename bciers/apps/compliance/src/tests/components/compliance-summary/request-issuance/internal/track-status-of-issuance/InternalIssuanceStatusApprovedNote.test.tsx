import { render, screen } from "@testing-library/react";
import { InternalIssuanceStatusApprovedNote } from "@/compliance/src/app/components/compliance-summary/request-issuance/internal/track-status-of-issuance/InternalIssuanceStatusApprovedNote";

describe("InternalIssuanceStatusApprovedNote", () => {
  it("displays the correct text content", () => {
    render(<InternalIssuanceStatusApprovedNote />);

    const approvedNoteTextPatterns = [
      /The issuance request is approved/i,
      /The earned credits have been issued/i,
      /to the holding account/i,
      /as identified below in B\.C\. Carbon Registry \(BCCR\) successfully/i,
    ];

    for (const textPattern of approvedNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });
});
