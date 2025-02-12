import { render, screen } from "@testing-library/react";
import {
  useSession,
  useRouter,
  getOperation,
  getFacility,
} from "@bciers/testConfig/mocks";
import FacilityPage from "apps/administration/app/components/facilities/FacilityPage";

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

  it("throws an error when given a bad facility id", async () => {
    getOperation.mockReturnValueOnce({
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
      type: "Single Facility Operation",
    });
    getFacility.mockReturnValueOnce({
      error: "yikes",
    });

    await expect(async () => {
      await render(
        await FacilityPage({
          operationId: "025328a0-f9e8-4e1a-888d-aa192cb053db",
          facilityId: "garbage-bugs-dump-truck-fire",
        }),
      );
    }).rejects.toThrow(
      new Error(
        "We couldn't find your facility information. Please ensure you have been approved for access to this facility.",
      ),
    );
  });

  it("throws an error when given a bad operation id", async () => {
    getOperation.mockReturnValueOnce({
      error: "yikes",
    });

    await expect(async () => {
      await render(
        await FacilityPage({
          operationId: "garbage-bugs-dump-truck-fire",
          facilityId: "025328a0-f9e8-4e1a-888d-aa192cb053db",
        }),
      );
    }).rejects.toThrow(
      new Error(
        "We couldn't find your operation information. Please ensure you have been approved for access to this operation.",
      ),
    );
  });

  it("renders the SFO create facility form with pre-populated fields", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "industry_user_admin",
        },
      },
    });
    getOperation.mockReturnValueOnce({
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
      type: "Single Facility Operation",
      name: "Test Operation Name",
    });
    getFacility.mockReturnValueOnce(undefined);
    const { container } = render(
      await FacilityPage({
        operationId: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
        facilityId: undefined,
      }),
    );
    expect(container.querySelector("#root_section1_name")).toHaveTextContent(
      "Test Operation Name",
    );
    expect(container.querySelector("#root_section1_type")).toHaveTextContent(
      "Single Facility",
    );
    expect(screen.queryByText(/well/i)).not.toBeInTheDocument(); // well authorization number is only for LFOs
  });

  it("renders the LFO readonly form with form data", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "industry_user_admin",
        },
      },
    });
    getFacility.mockReturnValueOnce({
      name: "Test Facility Name",
      type: "Large Facility",
      well_authorization_numbers: [3442, 42643],
      latitude_of_largest_emissions: "3.000000",
      longitude_of_largest_emissions: "4.000000",
      street_address: "adf",
      municipality: "ad",
      province: "BC",
      postal_code: "h0h0h0",
      id: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
    });
    getOperation.mockReturnValueOnce({
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
      type: "Linear Facility Operation",
    });
    render(
      await FacilityPage({
        operationId: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
        facilityId: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
      }),
    );
    expect(screen.getByText(/Test Facility Name/i)).toBeVisible();
    expect(screen.queryByText(/well/i)).toBeVisible();
  });
});
