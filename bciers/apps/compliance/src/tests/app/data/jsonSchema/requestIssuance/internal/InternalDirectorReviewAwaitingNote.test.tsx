import { InternalDirectorReviewAwaitingNote } from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/InternalDirectorReviewAwaitingNote";
import { render, screen } from "@testing-library/react";

describe("InternalDirectorReviewAwaitingNote", () => {
  it("displays the correct text content", () => {
    render(<InternalDirectorReviewAwaitingNote />);

    const awaitingNoteTextPatterns = [
      /Once the issuance request is approved/i,
      /the earned credits will be issued/i,
      /to the holding account/i,
      /as identified above in B\.C\. Carbon Registry/i,
    ];

    for (const textPattern of awaitingNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });
});
