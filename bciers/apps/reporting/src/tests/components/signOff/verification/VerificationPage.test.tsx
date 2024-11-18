import { render, screen, waitFor } from "@testing-library/react";
import VerificationPage from "@reporting/src/app/components/signOff/verification/VerificationPage";
import { verificationSchema } from "@reporting/src/data/jsonSchema/signOff/verification/verification";
import { createVerificationSchema } from "./mocks";

describe("VerificationPage component", () => {
  const mockVersionId = 3;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the VerificationForm with created schema", async () => {
    // Mock the resolved value for `createVerificationSchema`
    createVerificationSchema.mockResolvedValueOnce(verificationSchema);

    // Render the page with the `versionId` prop
    render(await VerificationPage({ versionId: mockVersionId }));

    await waitFor(() => {
      const input = screen.getByLabelText(/Verification body name/i);
      expect(input).toBeInTheDocument();
      expect(input).toBeVisible();
      expect(input).toHaveValue("");
    });
  });
});
