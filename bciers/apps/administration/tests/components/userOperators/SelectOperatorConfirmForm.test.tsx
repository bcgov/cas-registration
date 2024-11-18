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
  physical_street_address: "123 Main St",
  bc_corporate_registry_number: "abc1234567",
  business_structure: "Sole Proprietorship",
  physical_municipality: "Victoria",
  physical_province: "BC",
  physical_postal_code: "V1V 1V1",
  mailing_street_address: "test mailing street address",
  mailing_municipality: "test mailing municipality",
  mailing_province: "BC",
  mailing_postal_code: "V0V0V0",
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

    expect(screen.getByText("Physical Address")).toBeInTheDocument();
    expect(
      screen.getByText(operatorJSON.physical_street_address),
    ).toBeInTheDocument();

    expectButton("Yes this is my operator");
    expect(screen.getByText(/This is not my operator./)).toBeInTheDocument();
    expectLink("Return.", "/select-operator");
  });
  it("confirms the operator with admin when confirm button is clicked", async () => {
    render(
      <SelectOperatorConfirmForm operator={operatorJSON} hasAdmin={true} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Yes this is my operator/i }),
    );
    expectIcon("WarningIcon", {
      color: "#FF0E0E",
      fontSize: "50px",
    });
    expectMessage(
      "has-admin-message",
      `Looks like you do not have access to ${operatorJSON.legal_name}.An Operation Representative with Administrator access will need to approve your access request.Please confirm below if you would like to submit an access request.Request Access`,
    );
    expectButton("Request Access");
    expectLink("Go Back", "#");
  });
  it("confirms the operator with no admin when confirm button is clicked", async () => {
    render(
      <SelectOperatorConfirmForm operator={operatorJSON} hasAdmin={false} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Yes this is my operator/i }),
    );
    expectIcon("WarningIcon", {
      color: "#FF0E0E",
      fontSize: "50px",
    });
    expectMessage(
      "has-no-admin-message",
      `Looks like operator ${operatorJSON.legal_name} does not have Administrator access set up.Would you like to request Administrator access as an Operation Representative?Please note that you will be responsible for approving any additional users requesting access to the operator.Request Administrator Access`,
    );
    expectButton("Request Administrator Access");
    expectLink("Go Back", "#");
  });
});
