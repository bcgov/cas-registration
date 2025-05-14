import { expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useSession, signOut } from "next-auth/react";
import SessionTimeoutHandler, {
  ACTIVITY_THROTTLE_SECONDS,
  MODAL_DISPLAY_SECONDS,
} from "@bciers/components/auth/SessionTimeoutHandler";
import { getEnvValue } from "@bciers/actions";
import createThrottledEventHandler from "@bciers/components/auth/throttleEventsEffect";
import { LogoutWarningModalProps } from "@bciers/components/auth/LogoutWarningModal";
import * as Sentry from "@sentry/nextjs";

// Mock dependencies
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@bciers/actions", () => ({
  getEnvValue: vi.fn(),
}));

vi.mock("@bciers/components/auth/throttleEventsEffect", () => ({
  default: vi.fn(),
}));

vi.mock("@bciers/components/auth/LogoutWarningModal", () => ({
  default: ({
    showModal,
    initialTimeLeft,
    onExtendSession,
    onLogout,
  }: LogoutWarningModalProps) =>
    showModal ? (
      <div data-testid="logout-modal">
        <button onClick={onExtendSession}>Extend</button>
        <button onClick={onLogout}>Logout</button>
        Time left: {initialTimeLeft}
      </div>
    ) : null,
}));

describe("SessionTimeoutHandler", () => {
  const mockUpdate = vi.fn();
  const mockSignOut = signOut as ReturnType<typeof vi.fn>;
  const mockGetEnvValue = getEnvValue as ReturnType<typeof vi.fn>;
  const mockCreateThrottledEventHandler =
    createThrottledEventHandler as ReturnType<typeof vi.fn>;

  const defaultSession = {
    data: { expires: new Date(Date.now() + 180 * 1000).toISOString() },
    status: "authenticated",
    update: mockUpdate,
  };

  const renderWithSession = (sessionOverride = {}) => {
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      ...defaultSession,
      ...sessionOverride,
    });
    return render(<SessionTimeoutHandler />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetEnvValue.mockResolvedValue("http://logout.url"); // NOSONAR
    mockCreateThrottledEventHandler.mockReturnValue(vi.fn());
  });

  it("does not render anything when not authenticated", () => {
    renderWithSession({ status: "unauthenticated", data: null });
    expect(screen.queryByTestId("logout-modal")).not.toBeInTheDocument();
  });

  it("fetches logout URL on mount", () => {
    renderWithSession();
    expect(mockGetEnvValue).toHaveBeenCalledWith(
      "SITEMINDER_KEYCLOAK_LOGOUT_URL",
    );
  });

  it("sets up throttled event handler on mount when authenticated and modal is not shown", () => {
    renderWithSession();
    expect(mockCreateThrottledEventHandler).toHaveBeenCalledWith(
      expect.any(Function),
      ["mousemove", "keydown", "mousedown", "scroll"],
      ACTIVITY_THROTTLE_SECONDS,
    );
  });

  it("shows modal when session is about to expire", async () => {
    renderWithSession({
      data: {
        expires: new Date(
          Date.now() + (MODAL_DISPLAY_SECONDS + 1) * 1000,
        ).toISOString(),
      },
      update: mockUpdate.mockResolvedValue({
        expires: new Date(Date.now() + 180 * 1000).toISOString(),
      }),
    });

    await waitFor(
      () => {
        expect(screen.getByTestId("logout-modal")).toBeInTheDocument();
        expect(
          screen.getByText(`Time left: ${MODAL_DISPLAY_SECONDS}`),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it("logs out when session timeout reaches zero", async () => {
    renderWithSession({
      data: { expires: new Date(Date.now() - 1 * 1000).toISOString() },
    });

    expect(mockGetEnvValue).toHaveBeenCalledOnce();
    await waitFor(() => expect(mockSignOut).toHaveBeenCalledOnce());
  });

  it("extends session when user clicks extend", async () => {
    renderWithSession({
      data: {
        expires: new Date(
          Date.now() + (MODAL_DISPLAY_SECONDS + 1) * 1000,
        ).toISOString(),
      },
      update: mockUpdate.mockResolvedValue({
        expires: new Date(Date.now() + 180 * 1000).toISOString(),
      }),
    });

    await waitFor(
      () => expect(screen.getByTestId("logout-modal")).toBeInTheDocument(),
      {
        timeout: 2000,
      },
    );

    screen.getByText("Extend").click();
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(screen.queryByTestId("logout-modal")).not.toBeInTheDocument();
    });
  });

  it("logs out when user clicks logout in modal", async () => {
    renderWithSession({
      data: {
        expires: new Date(
          Date.now() + (MODAL_DISPLAY_SECONDS + 1) * 1000,
        ).toISOString(),
      },
    });

    await waitFor(
      () => expect(screen.getByTestId("logout-modal")).toBeInTheDocument(),
      {
        timeout: 2000,
      },
    );

    screen.getByText("Logout").click();
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: "http://logout.url", // NOSONAR
      });
    });
  });

  it("refreshes session on user activity when modal is not shown", async () => {
    let capturedRefreshSession: () => void;
    const mockTrigger = vi.fn();
    mockCreateThrottledEventHandler.mockImplementation((refreshSession) => {
      capturedRefreshSession = refreshSession;
      return () =>
        mockTrigger.mockImplementation(() => capturedRefreshSession());
    });

    renderWithSession();
    mockTrigger();

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
  });

  it("does not refresh session when modal is shown", async () => {
    renderWithSession({
      data: {
        expires: new Date(
          Date.now() + (MODAL_DISPLAY_SECONDS + 1) * 1000,
        ).toISOString(),
      },
    });

    const mockTrigger = vi.fn();
    mockCreateThrottledEventHandler.mockImplementation(() => () => mockTrigger);

    await waitFor(
      () => expect(screen.getByTestId("logout-modal")).toBeInTheDocument(),
      {
        timeout: 2000,
      },
    );

    mockUpdate.mockClear();
    mockTrigger();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it.only("handles session refresh failure by logging out", async () => {
    mockUpdate.mockRejectedValue(new Error("Refresh failed"));

    let capturedRefreshSession: () => Promise<void> = () => Promise.resolve();

    mockCreateThrottledEventHandler.mockImplementation((refreshSession) => {
      capturedRefreshSession = refreshSession;
      return () => {}; // Return a no-op cleanup function
    });

    renderWithSession();

    // Manually invoke the refreshSession to simulate activity
    await capturedRefreshSession();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: "http://logout.url", // NOSONAR
      });
    });
  });

  it("handles session refresh failure by logging out, alerting Sentry, and redirecting to fallback logoutUrl", async () => {
    const testError = new Error("Oops");
    const sentrySpy = vi.spyOn(Sentry, "captureException");

    mockGetEnvValue.mockReset(); // we set this in the beforeEach
    mockGetEnvValue.mockRejectedValueOnce(testError);
    mockUpdate.mockRejectedValue(new Error("Refresh failed"));

    let capturedRefreshSession: () => void;
    const mockTrigger = vi.fn();
    mockCreateThrottledEventHandler.mockImplementation((refreshSession) => {
      capturedRefreshSession = refreshSession;
      return () =>
        mockTrigger.mockImplementation(() => capturedRefreshSession());
    });

    renderWithSession();

    await waitFor(() => {
      expect(sentrySpy).toHaveBeenCalledWith(testError);
    });

    mockTrigger();

    await waitFor(() =>
      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: "/",
      }),
    );
  });
});
