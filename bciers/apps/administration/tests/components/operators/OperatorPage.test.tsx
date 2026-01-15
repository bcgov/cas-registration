import { render, screen } from "@testing-library/react";
import { auth, useRouter, useSearchParams } from "@bciers/testConfig/mocks";

useRouter.mockReturnValue({ query: {}, replace: vi.fn() });
useSearchParams.mockReturnValue({ get: vi.fn() });

// 1) Bridge getSessionRole -> auth()
vi.mock("@bciers/utils/src/sessionUtils", () => ({
  getSessionRole: vi.fn(async () => auth()?.user?.app_role ?? ""),
}));

// 2) Mock API module that OperatorPage uses
vi.mock("@bciers/actions/api", () => ({
  __esModule: true,
  getBusinessStructures: vi.fn(),
}));

// 3) Mock the schema builder at the EXACT path OperatorPage imports
vi.mock("apps/administration/app/data/jsonSchema/operator", () => ({
  __esModule: true,
  createOperatorSchema: vi.fn(async () => ({
    type: "object",
    properties: {},
  })),
}));

// 4) Mock getCurrentOperator / getOperator at exact paths
vi.mock(
  "apps/administration/app/components/operators/getCurrentOperator",
  () => ({
    __esModule: true,
    default: vi.fn(),
  }),
);

vi.mock("apps/administration/app/components/operators/getOperator", () => ({
  __esModule: true,
  default: vi.fn(),
}));

// 5) Mock OperatorForm so we’re testing OperatorPage logic only
vi.mock("apps/administration/app/components/operators/OperatorForm", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="operator-form">
      <div>isCreating:{String(props.isCreating)}</div>
      <div>isInternalUser:{String(props.isInternalUser)}</div>
      <div>legal_name:{props.formData?.legal_name ?? ""}</div>
      <div>business_structure:{props.formData?.business_structure ?? ""}</div>
    </div>
  ),
}));

// Import AFTER mocks
import OperatorPage from "apps/administration/app/components/operators/OperatorPage";
import getCurrentOperator from "apps/administration/app/components/operators/getCurrentOperator";
import getOperator from "apps/administration/app/components/operators/getOperator";
import { getBusinessStructures } from "@bciers/actions/api";

describe("OperatorPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // ✅ Prevent undefined across all tests unless overridden
    vi.mocked(getBusinessStructures).mockResolvedValue([
      { name: "BC Corporation" },
    ] as any);
  });

  it("throws when getCurrentOperator fails", async () => {
    auth.mockReturnValueOnce({ user: { app_role: "industry_user_admin" } });

    vi.mocked(getCurrentOperator).mockResolvedValueOnce({
      error: "no operator found",
    } as any);

    await expect(async () => {
      render(await OperatorPage({ isCreating: false }));
    }).rejects.toThrow("Failed to retrieve operator information");
  });

  it("throws when getBusinessStructures fails", async () => {
    auth.mockReturnValueOnce({ user: { app_role: "industry_user_admin" } });

    vi.mocked(getCurrentOperator).mockResolvedValueOnce({
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
    } as any);

    // ✅ Override the default for this specific test
    vi.mocked(getBusinessStructures).mockResolvedValueOnce({
      error: "no business structures",
    } as any);

    await expect(async () => {
      render(await OperatorPage({ isCreating: false }));
    }).rejects.toThrow("Failed to retrieve business structure information");
  });

  it("renders the operator form with form data (external user)", async () => {
    auth.mockReturnValueOnce({ user: { app_role: "industry_user_admin" } });

    vi.mocked(getCurrentOperator).mockResolvedValueOnce({
      legal_name: "Test Operator Name",
      business_structure: "BC Corporation",
    } as any);

    render(await OperatorPage({ isCreating: false }));

    const form = screen.getByTestId("operator-form");
    expect(form).toBeVisible();
    expect(form).toHaveTextContent("isCreating:false");
    expect(form).toHaveTextContent("isInternalUser:false");
    expect(form).toHaveTextContent("legal_name:Test Operator Name");
    expect(form).toHaveTextContent("business_structure:BC Corporation");
  });

  it("renders the operator form for adding a new operator (create mode)", async () => {
    auth.mockReturnValueOnce({ user: { app_role: "industry_user_admin" } });

    render(await OperatorPage({ isCreating: true }));

    const form = screen.getByTestId("operator-form");
    expect(form).toBeVisible();
    expect(form).toHaveTextContent("isCreating:true");
    expect(form).toHaveTextContent("isInternalUser:false");

    expect(vi.mocked(getCurrentOperator)).not.toHaveBeenCalled();
    expect(vi.mocked(getOperator)).not.toHaveBeenCalled();
  });
});
