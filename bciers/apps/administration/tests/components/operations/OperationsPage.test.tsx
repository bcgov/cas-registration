import { render } from "@testing-library/react";
import {
  fetchOperationsPageData,
  useRouter,
  useSearchParams,
} from "@bciers/testConfig/mocks";
import Operations from "@/administration/app/components/operations/OperationsPage";
import { getSessionRole } from "@bciers/testConfig/mocks";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

describe("OperationsPage component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    useRouter.mockReturnValue({
      query: {},
      replace: vi.fn(),
    });

    useSearchParams.mockReturnValue({
      get: vi.fn(),
    });
  });

  it("throws an error when there's a problem fetching data", async () => {
    getSessionRole.mockReturnValue("cas_director");
    fetchOperationsPageData.mockReturnValueOnce(undefined);
    await expect(async () => {
      render(await Operations({ searchParams: {} }));
    }).rejects.toThrow("Failed to retrieve operations");
  });
});
