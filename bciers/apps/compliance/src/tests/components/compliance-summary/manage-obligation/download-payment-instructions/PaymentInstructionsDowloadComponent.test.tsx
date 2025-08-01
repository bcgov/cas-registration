import PaymentInstructionsDownloadComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/download-payment-instructions/PaymentInstructionsDownloadComponent";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "@bciers/testConfig/mocks";

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

// Mocks
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

const setupComponent = (id = 123) =>
  render(
    <PaymentInstructionsDownloadComponent
      complianceReportVersionId={id}
      invoiceID={"OBI690837"}
    />,
  );

const downloadPDFButton = () =>
  screen.getByRole("button", { name: "Download Payment Information" });

describe("PaymentInstructionsDownloadComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen.mockClear();

    if (!("createObjectURL" in URL)) {
      // @ts-ignore
      URL.createObjectURL = vi.fn();
    }

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fake-invoice-url");
    vi.stubGlobal("open", mockWindowOpen);
  });

  it("renders the component with payee info and headings", () => {
    setupComponent();
    expect(screen.getByText("Download Payment Instructions")).toBeVisible();
    expect(screen.getByText("Payee Information")).toBeVisible();
    expect(
      screen.getByText("Canadian Imperial Bank of Commerce"),
    ).toBeVisible();
    expect(screen.getByText("00090")).toBeVisible();
    expect(screen.getByText("010")).toBeVisible();
    expect(screen.getByText("CIBCCATT")).toBeVisible();
    expect(screen.getByText("09-70301")).toBeVisible();
    expect(
      screen.getByText("Province of British Columbia-OBPS-BCIERS"),
    ).toBeVisible();
    expect(
      screen.getByText("1175 DOUGLAS STREET, VICTORIA, BC V8W2E1"),
    ).toBeVisible();
    expect(screen.getByText("Before making a payment")).toBeVisible();
    expect(
      screen.getByText("Pay by electronic fund transfer (EFT)"),
    ).toBeVisible();
    expect(screen.getByText("Pay by wire transfer")).toBeVisible();
    expect(
      screen.getByText("Provide correct information for timely processing"),
    ).toBeVisible();
    expect(downloadPDFButton()).toBeEnabled();
  });

  it("validates button text, and navigation", async () => {
    setupComponent();

    const backButton = screen.getByRole("button", { name: /back/i });
    const continueButton = screen.getByRole("button", { name: /continue/i });

    expect(downloadPDFButton()).toBeVisible();
    expect(backButton).toBeVisible();
    expect(continueButton).toBeVisible();

    // Check that buttons are enabled initially
    expect(downloadPDFButton()).toBeEnabled();
    expect(backButton).toBeEnabled();
    expect(continueButton).toBeEnabled();

    // Click back button and verify navigation
    fireEvent.click(backButton);
    expect(mockRouterPush).toHaveBeenCalledWith(
      "/compliance-summaries/123/manage-obligation-review-summary",
    );

    // Click continue button and verify navigation
    fireEvent.click(continueButton);
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        "/compliance-summaries/123/pay-obligation-track-payments",
      );
    });
  });

  it("handles pdf download correctly", async () => {
    const user = userEvent.setup();

    const mockBlob = new Blob(["dummy PDF"], { type: "application/pdf" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        blob: async () => mockBlob,
        headers: new Headers(),
      }),
    );

    setupComponent();

    await user.click(downloadPDFButton());

    expect(fetch).toHaveBeenCalledWith(
      "/compliance/api/payment-instructions/123",
      {
        method: "GET",
        cache: "no-store",
      },
    );

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      "blob:fake-invoice-url",
      "_blank",
      "noopener,noreferrer",
    );

    expect(downloadPDFButton()).toBeEnabled();
  });

  it("displays an error when pdf download fails", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({
          message: "Unable to generate invoice",
        }),
      }),
    );

    setupComponent(999);

    await user.click(downloadPDFButton());

    expect(fetch).toHaveBeenCalledWith(
      "/compliance/api/payment-instructions/999",
      {
        method: "GET",
        cache: "no-store",
      },
    );

    expect(mockWindowOpen).not.toHaveBeenCalled();

    const alerts = await screen.findAllByRole("alert");
    const hasErrorText = alerts.some(
      (el) =>
        el.textContent?.toLowerCase().includes("unable to generate invoice"),
    );
    expect(hasErrorText).toBe(true);
    expect(downloadPDFButton()).toBeEnabled();
  });

  it("validates form data is properly displayed", () => {
    setupComponent();

    // Check all hardcoded form data is displayed
    const expectedData = [
      "Canadian Imperial Bank of Commerce",
      "00090",
      "010",
      "CIBCCATT",
      "09-70301",
      "Province of British Columbia-OBPS-BCIERS",
      "1175 DOUGLAS STREET, VICTORIA, BC V8W2E1",
    ];

    expectedData.forEach((text) => {
      expect(screen.getByText(text)).toBeVisible();
    });
  });
});
