import Operation from "@/app/components/routes/operations/form/operation";
import { render, screen } from "@testing-library/react";
import createFetchMock from "vitest-fetch-mock";
import { describe, expect, vi } from "vitest";
import { SessionProvider } from "next-auth/react";

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

// Mock useFormStatus
vi.mock("react-dom", () => ({
  useFormStatus: jest.fn().mockReturnValue({ pending: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    query: { operation: "create" },
  }),
  useParams: () => ({
    formSection: "1",
    operation: "create",
  }),
}));

vi.mock("useSession", () => ({
  useSession: () => ({
    data: {
      user: {
        app_role: ["industry_admin"],
      },
    },
  }),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(() => Promise.resolve()),
  revalidatePath: vi.fn(() => Promise.resolve()),
}));

describe("Operations component", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    fetchMock.resetMocks();
    fetchMock.enableMocks(); // Enable fetch mocking
    // mock getUserFormData response
    fetchMock.mockResponseOnce(
      JSON.stringify({
        first_name: "bc-cas-dev",
        last_name: "Industry User",
        position_title: "Code Monkey",
        email: "email@email.com",
        phone_number: "+16044015432",
        bceid_business_name: "Existing Operator 2 Legal Name",
        app_role: { role_name: "industry_user" },
      }),
    );
    // mock getNaicsCodes response
    fetchMock.mockResponseOnce(
      JSON.stringify([
        {
          id: 1,
          naics_code: "211110",
          naics_description: "Oil and gas extraction (except oil sands)",
        },
        {
          id: 2,
          naics_code: "212114",
          naics_description: "Bituminous coal mining",
        },
      ]),
    );
    // mock getRegulatedProducts response
    fetchMock.mockResponseOnce(
      JSON.stringify([
        { id: 1, name: "BC-specific refinery complexity throughput" },
        { id: 2, name: "Cement equivalent" },
      ]),
    );
  });

  it("renders the dropdown options for fields that require a fetch (e.g. NAICS codes)", async () => {
    render(
      <SessionProvider>
        {await Operation({ numRow: undefined })}
      </SessionProvider>,
    );

    const naicsCode = screen.getByPlaceholderText(/NAICS code/i).closest("div");
    expect(naicsCode).toBeInTheDocument();

    await naicsCode.click();

    const naicsCodeOptions = screen.getAllByRole("combobox");
    expect(screen.getByText(/211110/i)).toBeVisible();
    expect(screen.getByText(/212114/i)).toBeVisible();
    expect(naicsCodeOptions).toHaveLength(3); // 2 options + empty string

    // check Regulated Products came in properly
    const regulatedProducts = screen
      .getByPlaceholderText(/Regulated Products/i)
      .closest("div");
    expect(regulatedProducts).toBeInTheDocument();

    await regulatedProducts.click();

    const regulatedProductsOptions = screen.getAllByRole("combobox");
    expect(
      screen.getByText(/BC-specific refinery complexity throughput/i),
    ).toBeVisible();
    expect(regulatedProductsOptions).toHaveLength(3); // 2 options + empty string
  });

  it("renders a blank form when there is no existing form data", async () => {
    render(
      <SessionProvider>
        {await Operation({ numRow: undefined })}
      </SessionProvider>,
    );

    expect(screen.getByLabelText(/Operation Name+/i)).not.toHaveValue();
  });

  // it("renders existing form data for existing operations", async () => {
  //   fetchMock.mockResponseOnce(JSON.stringify({ id: 1, name: "test" }));
  //   render(
  //     <SessionProvider>
  //       {await Operation({ numRow: "create" })}
  //     </SessionProvider>,
  //   );
  //
  //   expect(screen.getByLabelText(/Operation Name+/i)).toHaveValue();
  // });
});
