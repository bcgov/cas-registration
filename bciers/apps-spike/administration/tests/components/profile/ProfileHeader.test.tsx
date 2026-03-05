import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import ProfileHeader from "@/administration/app/components/profile/ProfileHeader";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

describe("ProfileHeader component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the profile note message", async () => {
    render(await ProfileHeader());

    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent("Please update or verify your information");
  });
});
