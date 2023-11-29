import Operation from "@/app/components/routes/operations/form/Operation";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";

// Mock useFormStatus
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormStatus: jest.fn().mockReturnValue({ pending: false }),
}));

describe("Operations component", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    fetchMock.resetMocks();
    fetchMock.enableMocks(); // Enable fetch mocking
    fetchMock.mockResponseOnce(
      JSON.stringify([
        {
          id: 1,
          naics_code: "string",
          ciip_sector: "string",
          naics_description: "string",
        },
      ]),
    );
  });

  it("renders the dropdown options for fields that require a fetch (e.g. NAICS codes)", async () => {
    render(await Operation({ numRow: undefined }));

    // check NAICS codes came in properly
    const codes = screen
      .getByLabelText(/Primary NAICS Code+/i)
      .querySelectorAll("option"); // Get all option elements within the select

    expect(codes.length).toBe(2); // One code plus empty string blank

    // check NAICS categories came in properly
    const categories = screen
      .getByLabelText(/NAICS Category+/i)
      .querySelectorAll("option");

    expect(categories.length).toBe(4);
  });

  it("renders a blank form when there is no existing form data", async () => {
    render(await Operation({ numRow: undefined }));

    expect(screen.getByLabelText(/Operation Name+/i)).not.toHaveValue();
  });

  it("renders existing form data for existing operations", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ id: 1, name: "test" }));
    render(await Operation({ numRow: 1 }));

    expect(screen.getByLabelText(/Operation Name+/i)).toHaveValue();
  });
});
