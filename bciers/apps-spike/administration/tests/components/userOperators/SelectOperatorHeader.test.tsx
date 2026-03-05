import { render, screen } from "@testing-library/react";
import SelectOperatorHeader from "apps/administration/app/components/userOperators/SelectOperatorHeader";
import { useSession } from "next-auth/react";
import getUserFullName from "@bciers/utils/src/getUserFullName";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("@bciers/utils/src/getUserFullName", () => ({
  default: vi.fn(),
}));

describe("SelectOperatorHeader component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the greeting with the user's first and last name and the prompt text", () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { name: "User Name" } },
      status: "authenticated",
      update: vi.fn(),
    } as any);

    vi.mocked(getUserFullName).mockReturnValue("User Name");

    render(<SelectOperatorHeader />);

    expect(screen.getByText(/Hi,/i)).toBeInTheDocument();
    expect(screen.getByText("User Name!")).toBeInTheDocument();

    expect(
      screen.getByText(/Which operator would you like to log in to\?/i),
    ).toBeInTheDocument();
  });
});
