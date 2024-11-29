import { userEvent } from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { actionHandler } from "@bciers/testConfig/mocks";

const bcghgIdWidgetLabel = "BCGHG ID";
const bcghgIdValue = "13251200001";

const bcghgIdWidgetSchema = {
  type: "object",
  properties: {
    bcghgIdTestField: {
      type: "string",
      title: bcghgIdWidgetLabel,
    },
  },
} as RJSFSchema;

const bcghgIdWidgetUiSchema = {
  bcghgIdTestField: {
    "ui:widget": "BcghgIdWidget",
  },
};

const defaultOperationFormContext = {
  operationId: "6d07d02a-1ad2-46ed-ad56-2f84313e98bf",
  isCasDirector: true,
};
const defaultFacilityFormContext = {
  facilityId: "ea4314ea-1974-465a-a851-278c8f9c8daa",
  isCasDirector: true,
};

describe("RJSF bcghgIdWidget", () => {
  it("for an external user, should show message when operation does not have a BCGHG ID yet", () => {
    const { container } = render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formContext={{
          ...defaultOperationFormContext,
          isCasDirector: false,
        }}
      />,
    );

    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent(/Pending/i);
  });

  it("for an external user, should show the readonly BCGHG ID", () => {
    const { container } = render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formData={{ bcghgIdTestField: bcghgIdValue }}
        formContext={{
          ...defaultOperationFormContext,
          isCasDirector: false,
        }}
      />,
    );
    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent(
      bcghgIdValue + " BCGHG ID issued",
    );
  });

  it("for an external user, should show message when facility does not have a BCGHG ID yet", () => {
    const { container } = render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formContext={{
          ...defaultFacilityFormContext,
          isCasDirector: false,
        }}
      />,
    );

    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent(/Pending/i);
  });

  it("for an external user, should show the readonly BCGHG ID for a facility", () => {
    const { container } = render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formData={{ bcghgIdTestField: bcghgIdValue }}
        formContext={{
          ...defaultFacilityFormContext,
          isCasDirector: false,
        }}
      />,
    );
    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent(
      bcghgIdValue + " BCGHG ID issued",
    );
  });

  it("for an internal user, should show the readonly BCGHG ID for an operation", () => {
    const { container } = render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formData={{ bcghgIdTestField: bcghgIdValue }}
        formContext={defaultOperationFormContext}
      />,
    );
    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent(
      bcghgIdValue + " BCGHG ID issued",
    );
  });

  it("for an internal user, should show the readonly BCGHG ID for a facility", () => {
    const { container } = render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formData={{ bcghgIdTestField: bcghgIdValue }}
        formContext={defaultFacilityFormContext}
      />,
    );
    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent(
      bcghgIdValue + " BCGHG ID issued",
    );
  });

  it("for an internal user, should issue a BCGHG ID for an operation", async () => {
    actionHandler.mockReturnValueOnce({ id: "23251209999" });
    const { container } = render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formContext={defaultOperationFormContext}
      />,
    );
    const issueButton = screen.getByRole("button", {
      name: `＋ Issue BCGHG ID`,
    });
    await userEvent.click(issueButton);
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf/bcghg-id",
      "PATCH",
      "",
    );
    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent(
      "23251209999 BCGHG ID issued",
    );
  });

  it("for an internal user, should issue a BCGHG ID for a facility", async () => {
    actionHandler.mockReturnValueOnce({ id: "23251209999" });
    const { container } = render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formContext={defaultFacilityFormContext}
      />,
    );
    const issueButton = screen.getByRole("button", {
      name: `＋ Issue BCGHG ID`,
    });
    await userEvent.click(issueButton);
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/facilities/ea4314ea-1974-465a-a851-278c8f9c8daa/bcghg-id",
      "PATCH",
      "",
    );
    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent(
      "23251209999 BCGHG ID issued",
    );
  });

  it("for an internal user, should show an error if generation fails", async () => {
    actionHandler.mockReturnValueOnce({ error: "Not for you" });
    render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formContext={defaultOperationFormContext}
      />,
    );
    const issueButton = screen.getByRole("button", {
      name: `＋ Issue BCGHG ID`,
    });
    await userEvent.click(issueButton);
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf/bcghg-id",
      "PATCH",
      "",
    );
    expect(screen.getByText(/not for you/i)).toBeVisible();
    await waitFor(() => {
      expect(
        screen.queryByText(/BCGHG ID issued successfully/i),
      ).not.toBeInTheDocument();
    });
  });
});
