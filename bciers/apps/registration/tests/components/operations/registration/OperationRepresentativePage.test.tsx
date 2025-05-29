import { render, screen } from "@testing-library/react";
import { useSessionRole, actionHandler } from "@bciers/testConfig/mocks";
import { OperationRepresentativePage } from "@/registration/app/components/operations/registration";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import userEvent from "@testing-library/user-event";
import { expect } from "vitest";

useSessionRole.mockReturnValue("industry_user_admin");

const contactsMockResponse = {
  items: [
    {
      id: 1,
      first_name: "Henry",
      last_name: "Ives",
      email: "henry.ives@example.com",
    },
    {
      id: 2,
      first_name: "Samantha",
      last_name: "Garcia",
      email: "samantha.garcia@email.com",
    },
  ],
  count: 1,
};

const existingOperationRepresentativesMockResponse = [
  {
    id: 1,
    full_name: "Henry Ives",
  },
];

describe("the OperationRepresentativePage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the Operation Representative Form", async () => {
    // contacts
    actionHandler.mockResolvedValueOnce(contactsMockResponse);

    // existingOperationRepresentatives
    actionHandler.mockResolvedValueOnce([]);

    render(
      await OperationRepresentativePage({
        step: 5,
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Representative",
    );
  });

  it("renders the appropriate error component when getContacts fails", async () => {
    // contacts
    actionHandler.mockResolvedValueOnce({ error: "oops!" });

    await expect(async () => {
      render(
        await OperationRepresentativePage({
          step: 5,
          operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
          steps: allOperationRegistrationSteps,
        }),
      );
    }).rejects.toThrow("Failed to Retrieve Contact");
  });

  it("renders the appropriate error component when getOperationRepresentatives fails", async () => {
    // contacts
    actionHandler.mockResolvedValueOnce(contactsMockResponse);

    // existingOperationRepresentatives
    actionHandler.mockResolvedValueOnce({ error: "oops!" });

    await expect(async () => {
      render(
        await OperationRepresentativePage({
          step: 5,
          operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
          steps: allOperationRegistrationSteps,
        }),
      );
    }).rejects.toThrow("Failed to Retrieve Operation Representatives");
  });

  it("renders the contacts that are not already operation representatives", async () => {
    // contacts
    actionHandler.mockResolvedValueOnce(contactsMockResponse);

    // existingOperationRepresentatives
    actionHandler.mockResolvedValueOnce(
      existingOperationRepresentativesMockResponse,
    );

    render(
      await OperationRepresentativePage({
        step: 5,
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        steps: allOperationRegistrationSteps,
      }),
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /add new operation representative/i,
      }),
    );

    await userEvent.click(
      screen.getByRole("combobox", {
        name: /select existing contact \(optional\)/i,
      }),
    );

    expect(
      screen.getByRole("option", {
        name: /samantha garcia/i,
      }),
    ).toBeVisible();

    expect(
      screen.queryByRole("option", {
        name: /henry ives/i,
      }),
    ).toBeNull();
  });
});
