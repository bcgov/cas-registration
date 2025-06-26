import { InternalDirectorReviewChangesNote } from "@/compliance/src/app/data/jsonSchema/requestIssuance/internal/InternalDirectorReviewChangesNote";
import { render, screen } from "@testing-library/react";

describe("InternalDirectorReviewChangesNote", () => {
  it("displays the correct text content", () => {
    render(<InternalDirectorReviewChangesNote />);

    const changesNoteTextPatterns = [
      /Changes were required in the previous step/i,
      /You may not decline or approve the request/i,
      /until the supplementary report is submitted/i,
      /and the earned credits are adjusted accordingly/i,
    ];

    for (const textPattern of changesNoteTextPatterns) {
      expect(screen.getByText(textPattern)).toBeVisible();
    }
  });
});
