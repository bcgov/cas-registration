import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "@bciers/testConfig/mocks";
import NavigationForm from "./NavigationForm";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockOnSubmit = vi.fn();

const schema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
  },
};

describe("NavigationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      bfcacheId: "",
    });
  });

  it("renders the form", () => {
    render(
      <NavigationForm
        schema={schema}
        formData={{ name: "Test" }}
        continueUrl="/next"
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByLabelText("Name")).toBeVisible();
    expect(
      screen.getByRole("button", { name: /save & continue/i }),
    ).toBeVisible();
  });

  it("submits and navigates when Save & Continue succeeds", async () => {
    mockOnSubmit.mockResolvedValueOnce(true);

    render(
      <NavigationForm
        schema={schema}
        formData={{ name: "Test" }}
        continueUrl="/next"
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /save & continue/i,
      }),
    );

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        formData: {
          name: "Test",
        },
      }),
      true,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/next");
    });
  });

  it("does not navigate when submission fails", async () => {
    mockOnSubmit.mockResolvedValueOnce(false);

    render(
      <NavigationForm
        schema={schema}
        formData={{ name: "Test" }}
        continueUrl="/next"
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /save & continue/i,
      }),
    );

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders validation errors", () => {
    render(
      <NavigationForm
        schema={schema}
        formData={{ name: "Test" }}
        continueUrl="/next"
        onSubmit={mockOnSubmit}
        errors={<div>Unable to complete the request.</div>}
      />,
    );

    expect(screen.getByText("Unable to complete the request.")).toBeVisible();
  });

  it("refreshes the router when navigation targets change", () => {
    const { rerender } = render(
      <NavigationForm
        schema={schema}
        formData={{ name: "Test" }}
        backUrl="/back"
        continueUrl="/next"
        onSubmit={mockOnSubmit}
      />,
    );

    rerender(
      <NavigationForm
        schema={schema}
        formData={{ name: "Test" }}
        backUrl="/different-back"
        continueUrl="/different-next"
        onSubmit={mockOnSubmit}
      />,
    );

    expect(mockRefresh).toHaveBeenCalled();
  });
});
