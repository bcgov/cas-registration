import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import SelectOperatorConfirmForm from "apps/administration/app/components/userOperators/SelectOperatorConfirmForm";
import { expectButton } from "@bciers/testConfig/helpers/expectButton";
import { expectIcon } from "@bciers/testConfig/helpers/expectIcon";
import { expectLink } from "@bciers/testConfig/helpers/expectLink";
import { expectMessage } from "@bciers/testConfig/helpers/expectMessage";

const operatorJSON = {
  id: 1,
  legal_name: "Operator 1 Legal Name",
  trade_name: "Operator 1 Trade Name",
  cra_business_number: "123456789",
  bc_corporate_registry_number: "abc1234567",
  business_structure: "Sole Proprietorship",
  street_address: "123 Main St",
  municipality: "Victoria",
  province: "BC",
  postal_code: "V1V 1V1",
  website: "https://www.example2.com",
  contacts: [101, 102, 103],
};

describe("Select Operator Confirm Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders the form correctly", async () => {
    render(
      <SelectOperatorConfirmForm operator={operatorJSON} hasAdmin={true} />,
    );
    expect(
      screen.getByText(
        "Kindly confirm if this is the operator that you represent.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Legal Name")).toBeInTheDocument();
    expect(screen.getByText(operatorJSON.legal_name)).toBeInTheDocument();

    expect(screen.getByText("Trade Name")).toBeInTheDocument();
    expect(screen.getByText(operatorJSON.trade_name)).toBeInTheDocument();

    expect(screen.getByText("CRA Business Number")).toBeInTheDocument();
    expect(
      screen.getByText(operatorJSON.cra_business_number),
    ).toBeInTheDocument();

    expect(screen.getByText("Street Address")).toBeInTheDocument();
    expect(screen.getByText(operatorJSON.street_address)).toBeInTheDocument();

    expectButton("Yes this is my operator");
    expect(screen.getByText(/This is not my operator./)).toBeInTheDocument();
    expectLink("Go back", "/select-operator");
  });
  it("confirms the operator with admin when confirm button is clicked", async () => {
    render(
      <SelectOperatorConfirmForm operator={operatorJSON} hasAdmin={true} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Yes this is my operator/i }),
    );
    expectIcon("WarningRoundedIcon", {
      color: "#FCBA19",
      fontSize: "40px",
    });
    expectMessage(
      "has-admin-message",
      `You do not currently have access to ${operatorJSON.legal_name}.Please request access below. An administrator will need to approve your access request.Request access`,
    );
    expectButton("Request access");
    expectLink("Go Back", "#");
  });
  it("confirms the operator with no admin when confirm button is clicked", async () => {
    render(
      <SelectOperatorConfirmForm operator={operatorJSON} hasAdmin={false} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Yes this is my operator/i }),
    );
    expectIcon("WarningRoundedIcon", {
      color: "#FCBA19",
      fontSize: "40px",
    });
    expectMessage(
      "has-no-admin-message",
      `The operator ${operatorJSON.legal_name} does not have an administrator yet.Request administrator access if you would like to be the administrator for thisoperator. Ministry staff will review your request.As an administrator, you can approve any additional users requesting access tothe operator and assign additional administrators.Request administrator access`,
    );
    expectButton("Request administrator access");
    expectLink("Go Back", "#");
  });
});
