import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProfileForm from "@/administration/app/components/profile/ProfileForm";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import {
  getSessionRole,
  getSession,
  actionHandler,
  getToken,
} from "@bciers/testConfig/mocks";
import {
  mockCasUserToken,
  mockIndustryUserToken,
} from "@bciers/testConfig/data/tokens";

// DISCLAIMER:
// This entire test file was, for the most part, written by ChatGPT.

function fillRequiredFields({
  firstName = "First",
  lastName = "Last",
  phoneNumber = "250-123-5555",
  positionTitle = "CEO",
} = {}) {
  fireEvent.change(screen.getByLabelText(/First Name/i), {
    target: { value: firstName },
  });
  fireEvent.change(screen.getByLabelText(/Last Name/i), {
    target: { value: lastName },
  });
  fireEvent.change(screen.getByLabelText(/Phone Number/i), {
    target: { value: phoneNumber },
  });
  fireEvent.change(screen.getByLabelText(/Position Title/i), {
    target: { value: positionTitle },
  });
}

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getToken.mockResolvedValue(mockIndustryUserToken);
    vi.mocked(getSessionRole).mockResolvedValue(FrontEndRoles.INDUSTRY_USER);
  });

  it("renders form with Submit button", () => {
    render(<ProfileForm isCreate={true} />);
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("does not show email help text for idir user", async () => {
    getToken.mockResolvedValue(mockCasUserToken);
    vi.mocked(getSession).mockResolvedValueOnce({ identity_provider: "idir" });
    render(<ProfileForm isCreate={true} />);
    await waitFor(() => {
      expect(screen.queryByText(/This email is used to log in/)).toBeNull();
    });
  });

  it("does not show email help text for external user being created", async () => {
    render(<ProfileForm isCreate={true} />);
    await waitFor(() => {
      expect(screen.queryByText(/This email is used to log in/)).toBeNull();
    });
  });

  it("shows extended email help text if contact record exists", async () => {
    getToken.mockResolvedValue(mockIndustryUserToken);
    vi.mocked(getSession).mockResolvedValueOnce({
      identity_provider: "bceidbusiness",
      user: { bceid_business_guid: "guid-123" },
    });
    vi.mocked(actionHandler).mockResolvedValueOnce("contact-456");

    render(<ProfileForm isCreate={false} />);

    // need to await the screen because it's rendered with useEffect
    expect(
      await screen.findByText(/This email is used to log in/),
    ).toBeInTheDocument();
    expect(await screen.findByText(/To change the email/)).toBeInTheDocument();
  });

  it("shows base email help text if contact lookup fails", async () => {
    vi.mocked(getSession).mockResolvedValueOnce({
      identity_provider: "bceidbusiness",
      user: { bceid_business_guid: "guid-123" },
    });
    vi.mocked(actionHandler).mockRejectedValue(new Error("API error"));

    render(<ProfileForm isCreate={false} />);
    fillRequiredFields();

    // need to await the screen because it's rendered with useEffect
    expect(
      await screen.findByText(/This email is used to log in/),
    ).toBeInTheDocument();
  });

  it("calls POST on submit when creating user", async () => {
    vi.mocked(getSession).mockResolvedValueOnce({
      identity_provider: "bceidbusiness",
      user: {},
    });
    vi.mocked(actionHandler).mockResolvedValueOnce({});

    render(<ProfileForm isCreate={true} />);

    fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/users",
        "POST",
        "/profile",
        {
          body: JSON.stringify({
            first_name: "First",
            last_name: "Last",
            phone_number: "+1 250 123 5555",
            position_title: "CEO",
            identity_provider: "",
          }),
        },
      );
    });
  });

  it("shows success state and resets after submit", async () => {
    vi.mocked(getSession).mockResolvedValueOnce({
      identity_provider: "bceidbusiness",
      user: {
        first_name: "First",
        last_name: "Last",
        email: "email@email.com",
      },
    });
    vi.mocked(actionHandler).mockResolvedValue({});

    render(<ProfileForm isCreate={false} />);

    fillRequiredFields();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByRole("button", { name: "✅ Success" }),
    ).toBeInTheDocument();
  });
});
