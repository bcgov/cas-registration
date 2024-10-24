import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { actionHandler } from "@bciers/testConfig/mocks";
import { OperationStatus } from "@bciers/utils/enums";

const boroIdWidgetLabel = "BORO ID";
const boroIdValue = "21-0001";

const boroIdWidgetSchema = {
  type: "object",
  properties: {
    boroIdTestField: {
      type: "string",
      title: boroIdWidgetLabel,
    },
  },
} as RJSFSchema;

const boroIdWidgetUiSchema = {
  boroIdTestField: {
    "ui:widget": "BoroIdWidget",
  },
};

const defaultFormContext = {
  operationId: "6d07d02a-1ad2-46ed-ad56-2f84313e98bf",
  isInternalUser: true,
  status: OperationStatus.REGISTERED,
};

describe("RJSF boroIdWidget", () => {
  it("should show Not Applicable when Operation is an EIO", async () => {
    const { container } = render(
      <FormBase
        schema={boroIdWidgetSchema}
        uiSchema={boroIdWidgetUiSchema}
        formContext={{
          ...defaultFormContext,
          isEio: true,
        }}
      />,
    );
    const readOnlyBoroIdTestField = container.querySelector(
      "#root_boroIdTestField",
    );
    expect(readOnlyBoroIdTestField).toBeVisible();
    expect(readOnlyBoroIdTestField).toHaveTextContent("Not applicable");
  });

  it("for an external user, should show message when status is not registered", async () => {
    const { container } = render(
      <FormBase
        schema={boroIdWidgetSchema}
        uiSchema={boroIdWidgetUiSchema}
        formContext={{
          ...defaultFormContext,
          status: OperationStatus.CHANGES_REQUESTED,
        }}
      />,
    );

    const readOnlyBoroIdTestField = container.querySelector(
      "#root_boroIdTestField",
    );
    expect(readOnlyBoroIdTestField).toBeVisible();
    expect(readOnlyBoroIdTestField).toHaveTextContent(
      /Cannot be issued yet. Operation is not registered./i,
    );
  });

  it("for an external user, should show message when operation does not have a BORO ID yet", async () => {
    const { container } = render(
      <FormBase
        schema={boroIdWidgetSchema}
        uiSchema={boroIdWidgetUiSchema}
        formContext={{
          ...defaultFormContext,
          isInternalUser: false,
          status: OperationStatus.REGISTERED,
        }}
      />,
    );

    const readOnlyBoroIdTestField = container.querySelector(
      "#root_boroIdTestField",
    );
    expect(readOnlyBoroIdTestField).toBeVisible();
    expect(readOnlyBoroIdTestField).toHaveTextContent(/Pending/i);
  });

  it("for an external user, should show the readonly BORO ID", async () => {
    const { container } = render(
      <FormBase
        schema={boroIdWidgetSchema}
        uiSchema={boroIdWidgetUiSchema}
        formData={{ boroIdTestField: boroIdValue }}
        formContext={{
          ...defaultFormContext,
          isInternalUser: false,
          status: OperationStatus.REGISTERED,
        }}
      />,
    );
    const readOnlyBoroIdTestField = container.querySelector(
      "#root_boroIdTestField",
    );
    expect(readOnlyBoroIdTestField).toBeVisible();
    expect(readOnlyBoroIdTestField).toHaveTextContent(
      boroIdValue + " BORO ID issued",
    );
  });

  it("for an internal user, should show the readonly BORO ID", async () => {
    const { container } = render(
      <FormBase
        schema={boroIdWidgetSchema}
        uiSchema={boroIdWidgetUiSchema}
        formData={{ boroIdTestField: boroIdValue }}
        formContext={defaultFormContext}
      />,
    );
    const readOnlyBoroIdTestField = container.querySelector(
      "#root_boroIdTestField",
    );
    expect(readOnlyBoroIdTestField).toBeVisible();
    expect(readOnlyBoroIdTestField).toHaveTextContent(
      boroIdValue + " BORO ID issued",
    );
  });

  it("for an internal user, should show the issue button when operation is eligible and should issue BORO ID", async () => {
    actionHandler.mockReturnValueOnce({ id: "23-0005" });
    const { container } = render(
      <FormBase
        schema={boroIdWidgetSchema}
        uiSchema={boroIdWidgetUiSchema}
        formContext={defaultFormContext}
      />,
    );
    const issueButton = screen.getByRole("button", {
      name: `＋ Issue BORO ID`,
    });
    await userEvent.click(issueButton);
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/v2/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf/boro-id",
      "PATCH",
      "registration/administration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf",
    );
    const readOnlyBoroIdTestField = container.querySelector(
      "#root_boroIdTestField",
    );
    expect(readOnlyBoroIdTestField).toBeVisible();
    expect(readOnlyBoroIdTestField).toHaveTextContent("23-0005 BORO ID issued");
  });

  it("for an internal user, should show an error if generation fails", async () => {
    actionHandler.mockReturnValueOnce({ error: "Not for you" });
    render(
      <FormBase
        schema={boroIdWidgetSchema}
        uiSchema={boroIdWidgetUiSchema}
        formContext={defaultFormContext}
      />,
    );
    const issueButton = screen.getByRole("button", {
      name: `＋ Issue BORO ID`,
    });
    await userEvent.click(issueButton);
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/v2/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf/boro-id",
      "PATCH",
      "registration/administration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf",
    );
    expect(screen.getByText(/not for you/i)).toBeVisible();
  });
});
