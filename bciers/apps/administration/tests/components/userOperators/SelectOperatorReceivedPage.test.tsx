import { render } from "@testing-library/react";
import { notFound } from "@bciers/testConfig/mocks";

import SelectOperatorReceivedPage from "apps/administration/app/components/userOperators/SelectOperatorReceivedPage";

import { expectIcon } from "@bciers/testConfig/helpers/expectIcon";
import { expectMessage } from "@bciers/testConfig/helpers/expectMessage";
import { id, operatorJSON } from "./constants";
import {
  getOperatorConfirmationInfo,
  getOperatorHasAdmin,
} from "../operators/mocks";

// ⛏️ Helper function to mock the state of the operator based on admin presence and access decline status
const mockOperatorState = (hasAdmin: boolean): void => {
  getOperatorConfirmationInfo.mockReturnValueOnce(operatorJSON);
  getOperatorHasAdmin.mockReturnValueOnce(hasAdmin);
};

describe("Select Operator Received Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the selected operator received page, admin access request correctly", async () => {
    mockOperatorState(false);
    render(await SelectOperatorReceivedPage({ step: "request-access", id }));
    expectIcon("AccessTimeIcon", {
      color: "#FFCC00",
      fontSize: "50px",
    });
    expectMessage(
      "access-request-message",
      `Your access request for ${operatorJSON.legal_name} as its Operation Representative has been received and will be reviewed.Once approved, you will receive an email.You can then log back in using your Business BCeID with Administrator access.`,
    );
  });
  it("renders the selected operator received page, subsequent access request correctly", async () => {
    mockOperatorState(true);
    render(await SelectOperatorReceivedPage({ step: "request-access", id }));
    expectIcon("AccessTimeIcon", {
      color: "#FFCC00",
      fontSize: "50px",
    });
    expectMessage(
      "subsequent-access-request-message",
      `Your access request has been sent to the Administrator(s) of ${operatorJSON.legal_name} for review.Once approved, you will receive an email.You can then log back in using your Business BCeID with the designated access type.`,
    );
  });
  it("renders the selected operator received page, add operator correctly", async () => {
    mockOperatorState(false);
    render(await SelectOperatorReceivedPage({ step: "add-operator", id }));
    expectIcon("AccessTimeIcon", {
      color: "#FFCC00",
      fontSize: "50px",
    });
    expectMessage(
      "add-operator-message",
      `Your request to add ${operatorJSON.legal_name} and become its Operation Representative has been received and will be reviewed.Once approved, you will receive an email.You can then log back in using your Business BCeID with Administrator access.`,
    );
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
