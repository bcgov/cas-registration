import { render, screen } from "@testing-library/react";
import { notFound } from "@bciers/testConfig/mocks";
import {
  getOperatorAccessDeclined,
  getOperatorConfirmationInfo,
  getOperatorHasAdmin,
} from "../operators/mocks";

import SelectOperatorConfirmPage from "apps/administration/app/components/userOperators/SelectOperatorConfirmPage";

import { expectIcon } from "@bciers/testConfig/helpers/expectIcon";
import { expectLink } from "@bciers/testConfig/helpers/expectLink";
import { expectMessage } from "@bciers/testConfig/helpers/expectMessage";
import { id, operatorJSON } from "./constants";

// ⛏️ Helper function to mock the state of the operator based on admin presence and access decline status
const mockOperatorState = (
  hasAdmin: boolean,
  accessDeclined: boolean,
): void => {
  getOperatorConfirmationInfo.mockReturnValueOnce(operatorJSON);
  getOperatorHasAdmin.mockReturnValueOnce(hasAdmin);
  getOperatorAccessDeclined.mockReturnValueOnce(accessDeclined);
};
// ⛏️ Helper function to render the SelectOperatorConfirmPage with the default id
const renderSelectOperatorConfirmPage = async () => {
  render(await SelectOperatorConfirmPage({ id }));
};

describe("Select Operator Confirm Page", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it("renders the confirm selected operator page correctly", async () => {
    mockOperatorState(false, false);
    await renderSelectOperatorConfirmPage();
    expect(
      screen.getByText(
        "Kindly confirm if this is the operator that you represent.",
      ),
    ).toBeVisible();
  });
  it("renders message for access declined, has admin", async () => {
    mockOperatorState(true, true);
    await renderSelectOperatorConfirmPage();
    expectIcon("WarningIcon");
    expectMessage(
      "access-declined-admin-message",
      `Your access request was declined by an Administrator of ${operatorJSON.legal_name}If you believe this is an error and you should be granted access, please contact the administrator of ${operatorJSON.legal_name}`,
    );
    expectLink("Select another operator", "/select-operator");
  });
  it("renders message for access declined, has no admin", async () => {
    mockOperatorState(false, true);
    await renderSelectOperatorConfirmPage();
    expectIcon("WarningIcon");
    expectMessage(
      "access-declined-no-admin-message",
      `Your Administrator access request to be the Operation Representative of ${operatorJSON.legal_name} was declined.If you believe this is an error and you should be granted access, please email us at GHGRegulator@gov.bc.ca`,
    );
    expectLink("Select another operator", "/select-operator");
  });
  it("renders error when getOperator fails", async () => {
    getOperatorConfirmationInfo.mockReturnValueOnce({
      error: "operator error",
    });
    getOperatorHasAdmin.mockReturnValueOnce(false);
    getOperatorAccessDeclined.mockReturnValueOnce(false);
    await expect(async () => {
      render(await SelectOperatorConfirmPage({ id }));
    }).rejects.toThrow("Failed to retrieve operator information.");
  });
  it("renders error when getOperatorHasAdmin fails", async () => {
    getOperatorConfirmationInfo.mockReturnValueOnce(operatorJSON);
    getOperatorAccessDeclined.mockReturnValueOnce(false);
    getOperatorHasAdmin.mockReturnValueOnce({
      error: "operator admin error",
    });
    await expect(async () => {
      render(await SelectOperatorConfirmPage({ id }));
    }).rejects.toThrow("Failed to retrieve operator information.");
  });
  it("renders notFound for invalid id", async () => {
    render(
      await SelectOperatorConfirmPage({
        id: undefined,
      }),
    );
    expect(notFound).toHaveBeenCalled();
  });
});
