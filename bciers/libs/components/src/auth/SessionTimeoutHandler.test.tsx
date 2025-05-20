import { expect, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { useSession, signOut } from "next-auth/react";
import SessionTimeoutHandler, {
  ACTIVITY_THROTTLE_SECONDS,
  MODAL_DISPLAY_SECONDS,
} from "@bciers/components/auth/SessionTimeoutHandler";
import { getEnvValue, getToken } from "@bciers/actions";
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
  getToken: vi.fn(),
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

let onmessageHandler: ((event: any) => void) | undefined;

export const postMessage = vi.fn();
export const close = vi.fn();

vi.mock("broadcast-channel", () => ({
  BroadcastChannel: vi.fn(() => ({
    postMessage,
    close,
    set onmessage(cb: typeof onmessageHandler) {
      onmessageHandler = cb;
    },
    get onmessage() {
      return onmessageHandler;
    },
  })),
}));

describe("SessionTimeoutHandler", () => {
  const mockUpdate = vi.fn();
  const mockSignOut = signOut as ReturnType<typeof vi.fn>;
  const mockGetEnvValue = getEnvValue as ReturnType<typeof vi.fn>;
  const mockGetToken = getToken as ReturnType<typeof vi.fn>;

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
    mockGetToken.mockResolvedValue({ exp: Math.floor(Date.now() / 1000) + 60 });
    mockSignOut.mockResolvedValue(undefined);
    mockGetEnvValue.mockResolvedValue("http://logout.url"); // NOSONAR
  });

  it("does not render anything when not authenticated", () => {
    renderWithSession({ status: "unauthenticated", data: null });
    expect(screen.queryByTestId("logout-modal")).not.toBeInTheDocument();
  });

  it("logs out, broadcasts, and redirects when session timeout reaches zero", async () => {
    renderWithSession({
      data: { expires: new Date(Date.now() - 1 * 1000).toISOString() },
    });

    expect(mockGetEnvValue).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith("logout");
    await waitFor(() =>
      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: "http://logout.url",
      }),
    );
  });

  it("logs out, broadcasts, and redirects to fallback url when session timeout reaches zero", async () => {
    mockGetEnvValue.mockClear();
    mockGetEnvValue.mockResolvedValue(undefined); // Simulate no logout URL
    renderWithSession({
      data: { expires: new Date(Date.now() - 1 * 1000).toISOString() },
    });

    expect(postMessage).toHaveBeenCalledWith("logout");
    await waitFor(() =>
      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: "/",
      }),
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
      expect(mockSignOut).not.toHaveBeenCalled();
    });
  });

  it("logs out and broadcasts when user clicks logout in modal", async () => {
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
    screen.getByText("Logout").click();
    expect(mockGetEnvValue).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith("logout");

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: "http://logout.url", // NOSONAR
      });
    });
  });

  it("handles session refresh failure by logging out", async () => {
    renderWithSession({
      data: {
        expires: new Date(
          Date.now() + (MODAL_DISPLAY_SECONDS + 1) * 1000,
        ).toISOString(),
      },
      update: mockUpdate.mockRejectedValue(new Error("Refresh failed")),
    });

    await waitFor(
      () => expect(screen.getByTestId("logout-modal")).toBeInTheDocument(),
      {
        timeout: 2000,
      },
    );

    screen.getByText("Extend").click();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: "http://logout.url", // NOSONAR
      });
    });
  });

  it("handles session refresh failure with no logoutUrl by logging out, alerting Sentry, and redirecting to fallback logoutUrl", async () => {
    const sentrySpy = vi.spyOn(Sentry, "captureException");

    mockGetEnvValue.mockReturnValue(undefined); // Simulate no logout URL

    renderWithSession({
      data: {
        expires: new Date(
          Date.now() + (MODAL_DISPLAY_SECONDS + 1) * 1000,
        ).toISOString(),
      },
      update: mockUpdate.mockRejectedValue(new Error("Refresh failed")),
    });

    await waitFor(
      () => expect(screen.getByTestId("logout-modal")).toBeInTheDocument(),
      {
        timeout: 2000,
      },
    );

    screen.getByText("Extend").click();

    await waitFor(() =>
      expect(mockSignOut).toHaveBeenCalledWith({
        redirectTo: "/",
      }),
    );

    expect(sentrySpy).toHaveBeenCalledWith("Failed to fetch logout URL");
  });
});
