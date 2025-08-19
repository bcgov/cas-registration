import { userEvent } from "@testing-library/user-event";
import { act, render, screen, waitFor } from "@testing-library/react";
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
  beforeEach(() => {
    actionHandler.mockReset();
  });

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
    expect(readOnlyBcghgIdTestField).toHaveTextContent(bcghgIdValue);
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
    expect(readOnlyBcghgIdTestField).toHaveTextContent(bcghgIdValue);
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
    expect(readOnlyBcghgIdTestField).toHaveTextContent(bcghgIdValue);
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
    expect(readOnlyBcghgIdTestField).toHaveTextContent(bcghgIdValue);
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
      {
        body: "{}",
      },
    );
    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent("23251209999");
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
      {
        body: "{}",
      },
    );
    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent("23251209999");
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
      {
        body: "{}",
      },
    );
    expect(screen.getByText(/not for you/i)).toBeVisible();
    await waitFor(() => {
      expect(
        screen.queryByText(/BCGHG ID issued successfully/i),
      ).not.toBeInTheDocument();
    });
  });

  it("Allows the user to update the BCGHGID for the operation manually ", async () => {
    actionHandler.mockReturnValueOnce({ id: "this_is_a_fake_bcghgid" });
    const { container } = render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formContext={defaultOperationFormContext}
      />,
    );
    await userEvent.click(screen.getByRole("link", { name: "edit" }));
    await userEvent.type(screen.getByRole("textbox"), "this_is_a_fake_bcghgid");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(actionHandler).toHaveBeenCalledWith(
      "registration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf/bcghg-id",
      "PATCH",
      "",
      { body: '{"bcghg_id":"this_is_a_fake_bcghgid"}' },
    );
    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent(
      "this_is_a_fake_bcghgid",
    );
  });

  it("Allows the user to update the BCGHGID for the facility manually ", async () => {
    actionHandler.mockReturnValueOnce({
      id: "this_is_a_fake_facility_bcghgid",
    });
    const { container } = render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formContext={defaultFacilityFormContext}
      />,
    );
    await userEvent.click(screen.getByRole("link", { name: "edit" }));
    await userEvent.type(
      screen.getByRole("textbox"),
      "this_is_a_fake_facility_bcghgid",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(actionHandler).toHaveBeenCalledWith(
      "registration/facilities/ea4314ea-1974-465a-a851-278c8f9c8daa/bcghg-id",
      "PATCH",
      "",
      { body: '{"bcghg_id":"this_is_a_fake_facility_bcghgid"}' },
    );
    const readOnlyBcghgIdTestField = container.querySelector(
      "#root_bcghgIdTestField",
    );
    expect(readOnlyBcghgIdTestField).toBeVisible();
    expect(readOnlyBcghgIdTestField).toHaveTextContent(
      "this_is_a_fake_facility_bcghgid",
    );
  });

  it("Displays the error if the manual BCGHG ID is not valid", async () => {
    actionHandler.mockReturnValueOnce({ error: "Invalid BCGHGID" });
    render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formContext={defaultOperationFormContext}
      />,
    );
    await userEvent.click(screen.getByRole("link", { name: "edit" }));
    await userEvent.type(screen.getByRole("textbox"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText(/Invalid BCGHGID/i)).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByText(/123456/i)).not.toBeInTheDocument();
    });
  });

  it("Reverts the display if the user clicks the cancel button", async () => {
    actionHandler.mockReturnValueOnce({ error: "Invalid BCGHGID" });
    render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formContext={defaultOperationFormContext}
      />,
    );
    await userEvent.click(screen.getByRole("link", { name: "edit" }));
    await userEvent.type(screen.getByRole("textbox"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByTestId("edit-bcghg-id-text").textContent).toBe(
      "or click edit to enter a BCGHGID",
    );
  });

  it("Displays a functional clear button if the BCGHG ID is set", async () => {
    actionHandler.mockReturnValueOnce(200);
    render(
      <FormBase
        schema={bcghgIdWidgetSchema}
        uiSchema={bcghgIdWidgetUiSchema}
        formContext={defaultFacilityFormContext}
        formData={{ bcghgIdTestField: bcghgIdValue }}
      />,
    );
    await act(async () =>
      userEvent.click(screen.getByRole("button", { name: "Clear BCGHG ID" })),
    );

    expect(actionHandler).toHaveBeenCalledWith(
      "registration/facilities/ea4314ea-1974-465a-a851-278c8f9c8daa/bcghg-id",
      "DELETE",
      "",
    );

    expect(
      screen.queryByRole("button", { name: "Clear BCGHG ID" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `＋ Issue BCGHG ID` }),
    ).toBeVisible();
  });
});
