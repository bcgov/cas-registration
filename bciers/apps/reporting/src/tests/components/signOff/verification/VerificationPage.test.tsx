import { render, screen, waitFor } from "@testing-library/react";
import VerificationPage from "@reporting/src/app/components/signOff/verification/VerificationPage";
import { verificationSchema } from "@reporting/src/data/jsonSchema/signOff/verification/verification";
import { createVerificationSchema } from "@reporting/src/app/components/signOff/verification/createVerificationSchema";
import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";

// ✨ Mocks
vi.mock(
  "@reporting/src/app/components/signOff/verification/createVerificationSchema",
  () => ({
    createVerificationSchema: vi.fn(),
  }),
);
vi.mock("@reporting/src/app/utils/getReportFacilityList", () => ({
  getReportFacilityList: vi.fn(),
}));

// 🏷 Constants
const mockVersionId = 3;
const mockfacilityList = {
  facilities: ["Facility 1", "Facility 2"],
};

// 🧪 Test suite
describe("VerificationPage component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("renders the VerificationForm", async () => {
    (getReportFacilityList as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockfacilityList,
    );
    // Mock the returned value for `createVerificationSchema`
    (createVerificationSchema as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      verificationSchema,
    );
    // Render the page with the `versionId` prop
    render(await VerificationPage({ versionId: mockVersionId }));

    // Assert the VerificationForm is rendered
    await waitFor(() => {
      const input = screen.getByLabelText(/Verification body name/i);
      expect(input).toBeInTheDocument();
      expect(input).toBeVisible();
      expect(input).toHaveValue("");
    });
  });
});
