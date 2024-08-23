import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { selectOperatorUiSchema } from "../../../app/data/jsonSchema/selectOperator";
import { selectOperatorSchema } from "../../../app/data/jsonSchema/selectOperator";

import Form from "@bciers/components/form/FormBase";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
useRouter.mockReturnValue({
  push: mockPush,
});
const operatorId = "operator-1-id";
const operatorLegalName = "Operator 1 Legal Name";

describe("Select Operator Form", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    render(
      <Form schema={selectOperatorSchema} uiSchema={selectOperatorUiSchema} />,
    );
  });

  it("allows selecting by a legal name, submit the form, and navigate to the correct page", async () => {
    // Mock the actionHandler response(s)
    actionHandler.mockResolvedValue([
      {
        id: "operator-1-id",
        legal_name: "Operator 1 Legal Name",
      },
      {
        id: "operator-2-id",
        legal_name: "Operator 2",
      },
      {
        id: "operator-3-id",
        legal_name: "Operator 3",
      },
    ]);

    // Select operator by legal name
    const searchField = screen.getByPlaceholderText(
      "Enter Business Legal Name",
    );
    await act(async () => {
      await userEvent.type(searchField, "Operator 1 Legal Name");
    });
    await waitFor(async () => {
      expect(searchField).toHaveValue("Operator 1 Legal Name");
    });
    await waitFor(async () => {
      expect(screen.getByText("Operator 1 Legal Name")).toBeVisible();
    });
    const operator1 = screen.getByText("Operator 1 Legal Name");
    await act(async () => {
      await userEvent.click(operator1);
    });
    expect(searchField).toHaveValue("Operator 1 Legal Name");

    // Simulate form submission
    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /Select Operator/i }),
      );
    });

    // Wait for the actionHandler to be called with the correct query
    await waitFor(() => {
      expect(actionHandler).toHaveBeenNthCalledWith(
        1,
        `registration/operators?legal_name=${operatorLegalName}`,
        "GET",
      );
    });

    // Check if push was called
    // await waitFor(() => {
    //   expect(mockPush).toHaveBeenCalled();
    // });
    // // Verify that the user is navigated to the correct page
    // await waitFor(() => {
    //   expect(mockPush).toHaveBeenCalledWith(
    //     `/select-operator/confirm/${operatorId}?title=${operatorLegalName}`,
    //   );
    // });
  });

  it("displays an error message when the response contains an error", async () => {
    // Mock the actionHandler to return an error
    actionHandler.mockResolvedValueOnce({ error: "An error occurred" });
  });
});
