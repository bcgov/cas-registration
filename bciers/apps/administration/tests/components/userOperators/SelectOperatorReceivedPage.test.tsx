import { render, screen } from "@testing-library/react";
import { notFound } from "@bciers/testConfig/mocks";
import { getCurrentUserOperator } from "@/administration/tests/components/userOperators/mocks";
import SelectOperatorReceivedPage from "apps/administration/app/components/userOperators/SelectOperatorReceivedPage";
import { expectIcon } from "@bciers/testConfig/helpers/expectIcon";
import { expectMessage } from "@bciers/testConfig/helpers/expectMessage";
import { id, operatorJSON, UserOperatorJSON } from "./constants";
import {
  getOperatorConfirmationInfo,
  getOperatorHasAdmin,
} from "@/administration/tests/components/operators/mocks";

// ⛏️ Helper function to mock the state of the operator based on admin presence and access decline status
const mockOperatorState = (hasAdmin: boolean): void => {
  getOperatorConfirmationInfo.mockReturnValueOnce(operatorJSON);
  getOperatorHasAdmin.mockReturnValueOnce(hasAdmin);
  getCurrentUserOperator.mockReturnValueOnce(UserOperatorJSON);
};

const expectCancelRequestButton = () => {
  expect(
    screen.getByRole("button", { name: "Cancel Access Request" }),
  ).toBeVisible();
};

describe("Select Operator Received Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the selected operator received page, admin access request correctly", async () => {
    mockOperatorState(false);
    render(await SelectOperatorReceivedPage({ step: "request-access", id }));
    expectIcon("AccessTimeFilledIcon", {
      color: "#FFCC00",
      fontSize: "50px",
    });
    expectMessage(
      "access-request-message",
      `Your access request as administrator for ${operatorJSON.legal_name} has been received by ministry staff and will be reviewed shortly.Once approved, you will receive a confirmation email. You can then log back in using your Business BCeID.`,
    );
    expectCancelRequestButton();
  });
  it("renders the selected operator received page, subsequent access request correctly", async () => {
    mockOperatorState(true);
    render(await SelectOperatorReceivedPage({ step: "request-access", id }));
    expectIcon("AccessTimeFilledIcon", {
      color: "#FFCC00",
      fontSize: "50px",
    });
    expectMessage(
      "subsequent-access-request-message",
      `Your access request has been sent to the Administrator(s) of ${operatorJSON.legal_name} for review.Once approved, you will receive an email.You can then log back in using your Business BCeID with the designated access type.`,
    );
    expectCancelRequestButton();
  });
  it("renders error when getOperator fails", async () => {
    getOperatorConfirmationInfo.mockReturnValueOnce({
      error: "operator error",
    });
    getOperatorHasAdmin.mockReturnValueOnce(false);
    await expect(async () => {
      render(
        await SelectOperatorReceivedPage({
          step: "error",
          id: id,
        }),
      );
    }).rejects.toThrow("Failed to retrieve operator information.");
  });
  it("renders error when getOperatorHasAdmin fails", async () => {
    getOperatorConfirmationInfo.mockReturnValueOnce(operatorJSON);
    getOperatorHasAdmin.mockReturnValueOnce({
      error: "operator admin error",
    });
    await expect(async () => {
      render(
        await SelectOperatorReceivedPage({
          step: "error",
          id: id,
        }),
      );
    }).rejects.toThrow("Failed to retrieve operator information.");
  });
  it("renders error when getCurrentUserOperator fails", async () => {
    getOperatorConfirmationInfo.mockReturnValueOnce(operatorJSON);
    getOperatorHasAdmin.mockReturnValueOnce(false);
    getCurrentUserOperator.mockReturnValueOnce({ error: "current user error" });
    await expect(async () => {
      render(
        await SelectOperatorReceivedPage({
          step: "error",
          id: id,
        }),
      );
    }).rejects.toThrow("Failed to retrieve current user operator information.");
  });
  it("renders notFound for invalid id", async () => {
    render(
      await SelectOperatorReceivedPage({
        step: "invalid",
        id: undefined,
      }),
    );
    expect(notFound).toHaveBeenCalled();
  });
});
