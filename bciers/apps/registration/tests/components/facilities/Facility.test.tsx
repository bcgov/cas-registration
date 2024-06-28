import { render, screen } from "@testing-library/react";
import {
  useSession,
  notFound,
  useRouter,
  getFacility,
  getOperation,
} from "@bciers/testConfig/mocks";
import Facility from "apps/registration/app/components/facilities/Facility";

vi.mock("apps/registration/app/components/facilities/getFacility", () => ({
  default: getFacility,
}));
vi.mock("apps/registration/app/components/operations/getOperation", () => ({
  default: getOperation,
}));

useSession.mockReturnValue({
  get: vi.fn(),
});

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

describe("Facilities component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it("renders the not found page when given a bad facility id", async () => {
    getOperation.mockReturnValueOnce({
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
      type: "Single Facility Operation",
    });
    getFacility.mockReturnValueOnce({
      error: "yikes",
    });
    render(
      await Facility({
        operationId: "025328a0-f9e8-4e1a-888d-aa192cb053db",
        facilityId: "garbage-bugs-dump-truck-fire",
      }),
    );
    expect(notFound).toHaveBeenCalled();
  });

  it("renders the not found page when given a bad operation id", async () => {
    getOperation.mockReturnValueOnce({
      error: "yikes",
    });
    render(
      await Facility({
        operationId: "garbage-bugs-dump-truck-fire",
        facilityId: "025328a0-f9e8-4e1a-888d-aa192cb053db",
      }),
    );
    expect(notFound).toHaveBeenCalled();
  });

  it("renders the SFO create facility form with no form data", async () => {
    getOperation.mockReturnValueOnce({
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
      type: "Single Facility Operation",
    });
    getFacility.mockReturnValueOnce(undefined);
    render(
      await Facility({
        operationId: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
        facilityId: undefined,
      }),
    );
    expect(screen.getByLabelText(/facility name/i)).toHaveValue("");
    expect(screen.queryByText(/well/i)).not.toBeInTheDocument(); // well authorization number is only for LFOs
  });
  it("renders the LFO readonly form with form data", async () => {
    getFacility.mockReturnValueOnce({
      section1: {
        name: "Test Facility Name",
        type: "Large Facility",
        well_authorization_numbers: [3442, 42643],
      },
      section2: {
        latitude_of_largest_emissions: "3.000000",
        longitude_of_largest_emissions: "4.000000",
        street_address: "adf",
        municipality: "ad",
        province: "BC",
        postal_code: "h0h0h0",
      },
      id: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
    });
    getOperation.mockReturnValueOnce({
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
      type: "Linear Facility Operation",
    });
    render(
      await Facility({
        operationId: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
        facilityId: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
      }),
    );
    expect(screen.getByText(/Test Facility Name/i)).toBeVisible();
    expect(screen.queryByText(/well/i)).toBeVisible();
  });
});
