import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SingleStepTaskListForm from "./SingleStepTaskListForm";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { FormMode } from "@bciers/utils/src/enums";
import { FrontendMessages } from "@bciers/utils/src/enums";
const section1: RJSFSchema = {
  type: "object",
  title: "Section 1",
  required: ["first_name", "last_name"],
  properties: {
    first_name: {
      type: "string",
      title: "First name",
    },
    last_name: {
      type: "string",
      title: "Last name",
    },
  },
};

const section2: RJSFSchema = {
  type: "object",
  title: "Section 2",
  required: ["phone", "email"],
  properties: {
    phone: {
      type: "string",
      title: "Phone",
      format: "phone",
    },
    email: {
      type: "string",
      title: "Email",
      format: "email",
    },
  },
};

const section3: RJSFSchema = {
  type: "object",
  title: "Section 3",
  required: ["address", "city"],
  properties: {
    address: {
      type: "string",
      title: "Address",
    },
    city: {
      type: "string",
      title: "City",
    },
  },
  well_authorization_numbers: {
    type: "array",
    items: {
      type: "number",
    },
    title: "Well Authorization Number(s)",
  },
};

export const schema: RJSFSchema = {
  type: "object",
  required: ["section1", "section2", "section3"],
  properties: {
    section1,
    section2,
    section3,
  },
};

export const uiSchema: UiSchema = {
  "ui:FieldTemplate": SectionFieldTemplate,
  "ui: options": {
    label: false,
  },
  section1: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },
  section2: {
    "ui:FieldTemplate": SectionFieldTemplate,
    phone: {
      "ui:widget": "PhoneWidget",
    },
    email: {
      "ui:widget": "EmailWidget",
    },
  },
  section3: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },
};

const mockFormData = {
  first_name: "Test",
  last_name: "User",
  phone: "+1234567890",
  email: "test@testing.ca",
  address: "123 Test St",
  city: "Victoria",
};

const consoleSpy = vi.spyOn(console, "log");

describe("the SingleStepTaskListForm component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render successfully with no formData", () => {
    render(
      <SingleStepTaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={{}}
        onCancel={() => {
          // eslint-disable-next-line no-console
          console.log("cancel");
        }}
        onSubmit={async (e) => {
          // eslint-disable-next-line no-console
          console.log("submit", e);
        }}
      />,
    );

    // It should render the task list sections
    expect(screen.getByRole("button", { name: "Section 1" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Section 2" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Section 3" })).toBeVisible();

    // It should render the form sections and fields
    expect(screen.getByRole("heading", { name: "Section 1" })).toBeVisible();
    expect(screen.getByLabelText("First name*")).toBeVisible();
    expect(screen.getByLabelText("Last name*")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Section 2" })).toBeVisible();
    expect(screen.getByLabelText("Phone*")).toBeVisible();
    expect(screen.getByLabelText("Email*")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Section 3" })).toBeVisible();
    expect(screen.getByLabelText("Address*")).toBeVisible();
    expect(screen.getByLabelText("City*")).toBeVisible();

    // It should render the submit and cancel buttons
    expect(screen.getByRole("button", { name: "Submit" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
  });
  it("should show the confirmation snackbar when new form is submitted (when creating)", async () => {
    const schemaNonRequired: RJSFSchema = {
      type: "object",
      properties: {
        section1,
        section2,
        section3,
      },
    };
    render(
      <SingleStepTaskListForm
        schema={schemaNonRequired}
        uiSchema={uiSchema}
        formData={{}}
        onCancel={() => {
          // eslint-disable-next-line no-console
          console.log("cancel");
        }}
        onSubmit={async (e) => {
          // eslint-disable-next-line no-console
          console.log("submit", e);
        }}
      />,
    );
    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(FrontendMessages.SUBMIT_CONFIRMATION),
      ).toBeVisible();
    });

    // check that the component correctly unnested the formData
    expect(consoleSpy.mock.calls[0][1].formData).toEqual({});
  });
  it("should transform and render the formData (when editing)", () => {
    render(
      <SingleStepTaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={mockFormData}
        mode={FormMode.READ_ONLY}
        onCancel={() => {
          // eslint-disable-next-line no-console
          console.log("cancel");
        }}
        onSubmit={async (e) => {
          // eslint-disable-next-line no-console
          console.log("submit", e);
        }}
        inlineMessage={"Testing inline message"}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("First name*")).toHaveValue("Test");
    expect(screen.getByLabelText("Last name*")).toHaveValue("User");
    expect(screen.getByLabelText("Phone*")).toHaveValue("234 567 890");
    expect(screen.getByLabelText("Email*")).toHaveValue("test@testing.ca");
    expect(screen.getByLabelText("Address*")).toHaveValue("123 Test St");
    expect(screen.getByLabelText("City*")).toHaveValue("Victoria");

    // It should render the correct buttons
    expect(screen.getByRole("button", { name: "Submit" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
    expect(screen.getByText("Testing inline message")).toBeVisible();
  });

  it("should call the onSubmit function, transform the form data, and shows the confirmation snackbar when the form is submitted", async () => {
    render(
      <SingleStepTaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={mockFormData}
        mode={FormMode.READ_ONLY}
        onCancel={() => {
          // eslint-disable-next-line no-console
          console.log("cancel");
        }}
        onSubmit={async (e) => {
          // eslint-disable-next-line no-console
          console.log("submit", e);
        }}
      />,
    );
    const editButton = screen.getByRole("button", { name: "Edit" });
    fireEvent.click(editButton);
    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(
        screen.getByText(FrontendMessages.SUBMIT_CONFIRMATION),
      ).toBeVisible();
    });

    // check that the component correctly unnested the formData
    expect(consoleSpy.mock.calls[0][1].formData).toEqual({
      address: "123 Test St",
      city: "Victoria",
      email: "test@testing.ca",
      first_name: "Test",
      last_name: "User",
      phone: "+1234567890",
    });
  });

  it("should call the onCancel function when the form is cancelled", async () => {
    render(
      <SingleStepTaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={mockFormData}
        onCancel={() => {
          // eslint-disable-next-line no-console
          console.log("cancel");
        }}
        onSubmit={async (e) => {
          // eslint-disable-next-line no-console
          console.log("submit", e);
        }}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    expect(consoleSpy).toHaveBeenCalledOnce();
  });

  it("should trigger validation errors when required fields are left blank", async () => {
    render(
      <SingleStepTaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={{}}
        onCancel={() => {
          // eslint-disable-next-line no-console
          console.log("cancel");
        }}
        onSubmit={async (e) => {
          // eslint-disable-next-line no-console
          console.log("submit", e);
        }}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    const errorMessages = screen.getAllByText("Required field");

    expect(errorMessages).toHaveLength(6);
  });

  it("should enable live validation on first error", async () => {
    render(
      <SingleStepTaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={{}}
        onCancel={() => {
          // eslint-disable-next-line no-console
          console.log("cancel");
        }}
        onSubmit={async (e) => {
          // eslint-disable-next-line no-console
          console.log("submit", e);
        }}
      />,
    );

    const input = screen.getByLabelText("First name*");
    const inputBorderElement = input.parentElement?.querySelector(
      "fieldset",
    ) as Element;
    const defaultStyle = "border-color: rgba(0, 0, 0, 0.23)";
    const errorStyle = "border-color: #d8292f";

    expect(inputBorderElement).toHaveStyle(defaultStyle);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    expect(inputBorderElement).toHaveStyle(errorStyle);

    fireEvent.change(input, { target: { value: "Test" } });

    expect(inputBorderElement).toHaveStyle(defaultStyle);
  });

  it("should render an api error if an error is passed", () => {
    render(
      <SingleStepTaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={{}}
        onCancel={() => {
          // eslint-disable-next-line no-console
          console.log("cancel");
        }}
        onSubmit={async (e) => {
          // eslint-disable-next-line no-console
          console.log("submit", e);
        }}
        error={"Name: Facility with this Name already exists"}
      />,
    );
    expect(screen.getByTestId("ErrorOutlineIcon")).toBeVisible();
    expect(
      screen.getByText("Name: Facility with this Name already exists"),
    ).toBeVisible();
  });

  it("should not render Edit/Submit button when allowEdit is false", () => {
    render(
      <SingleStepTaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={{}}
        onCancel={() => {
          // eslint-disable-next-line no-console
          console.log("cancel");
        }}
        onSubmit={async (e) => {
          // eslint-disable-next-line no-console
          console.log("submit", e);
        }}
        allowEdit={false}
      />,
    );
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();
  });

  it("should not render the Tasklist sidebar or Cancel button when showTasklist  and showCancelButton is false", () => {
    render(
      <SingleStepTaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={{}}
        showTasklist={false}
        showCancelButton={false}
        onCancel={() => {
          // eslint-disable-next-line no-console
          console.log("cancel");
        }}
        onSubmit={async (e) => {
          // eslint-disable-next-line no-console
          console.log("submit", e);
        }}
        allowEdit={false}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Section 1" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Section 2" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Section 3" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cancel" }),
    ).not.toBeInTheDocument();
  });
});

// it("should render the task list checkmarks as sections are filled", async () => {
//   render(
//     <SingleStepTaskListForm
//       schema={schema}
//       uiSchema={uiSchema}
//       formData={{}}
//       onCancel={() => console.log("cancel")}
//       onSubmit={async (e) => console.log("submit", e)}
//     />,
//   );
//   expect(screen.getByTestId("section1-tasklist-check")).not.toContainHTML(
//     "svg",
//   );
//   await userEvent.type(screen.getByLabelText(/First name+/i), "test");
//   await userEvent.type(screen.getByLabelText(/Last name+/i), "test");

//   expect(screen.getByTestId("section1-tasklist-check")).toContainHTML("svg");
//   expect(screen.getByTestId("section2-tasklist-check")).not.toContainHTML(
//     "svg",
//   );
//   expect(screen.getByTestId("section3-tasklist-check")).not.toContainHTML(
//     "svg",
//   );
// });

// it("should render the correct task list checks when formData is provided", () => {
//   render(
//     <SingleStepTaskListForm
//       schema={schema}
//       uiSchema={uiSchema}
//       formData={{
//         first_name: "Test",
//         last_name: "User",
//         phone: "+1234567890",
//         email: "test@testing.ca",
//       }}
//       onCancel={() => console.log("cancel")}
//       onSubmit={async (e) => console.log("submit", e)}
//       disabled={false}
//     />,
//   );

//   expect(screen.getByTestId("section1-tasklist-check")).toContainHTML("svg");
//   expect(screen.getByTestId("section2-tasklist-check")).toContainHTML("svg");
//   expect(screen.queryByTestId("section3-tasklist-check")).not.toContainHTML(
//     "svg",
//   );
// });

// it("should validate each section as the user types and display check in task list", async () => {
//   render(
//     <SingleStepTaskListForm
//       schema={schema}
//       uiSchema={uiSchema}
//       formData={{}}
//       onCancel={() => console.log("cancel")}
//       onSubmit={async (e) => console.log("submit", e)}
//     />,
//   );

//   expect(screen.queryByTestId("section1-tasklist-check")).not.toContainHTML(
//     "svg",
//   );
//   expect(screen.queryByTestId("section2-tasklist-check")).not.toContainHTML(
//     "svg",
//   );
//   expect(screen.queryByTestId("section3-tasklist-check")).not.toContainHTML(
//     "svg",
//   );

//   // Fill in section 1 fields and verify the task list check appears
//   const firstNameField = screen.getByLabelText("First name*");
//   const lastNameField = screen.getByLabelText("Last name*");

//   fireEvent.change(firstNameField, { target: { value: "Test" } });
//   fireEvent.change(lastNameField, { target: { value: "User" } });

//   expect(screen.getByTestId("section1-tasklist-check")).toContainHTML("svg");

//   // Fill in section 2 fields and verify the task list check appears
//   const phoneField = screen.getByLabelText("Phone*");
//   const emailField = screen.getByLabelText("Email*");

//   fireEvent.change(phoneField, { target: { value: "12345678901" } });
//   fireEvent.change(emailField, { target: { value: "test@testing.ca" } });

//   expect(screen.getByTestId("section2-tasklist-check")).toContainHTML("svg");

//   // Fill in section 3 fields and verify the task list check appears
//   const addressField = screen.getByLabelText("Address*");
//   const cityField = screen.getByLabelText("City*");

//   fireEvent.change(addressField, { target: { value: "123 Test St" } });
//   fireEvent.change(cityField, { target: { value: "Victoria" } });

//   expect(screen.getByTestId("section3-tasklist-check")).toContainHTML("svg");
// });

// it("should not render a task list check if the format validation fails", () => {
//   render(
//     <SingleStepTaskListForm
//       schema={schema}
//       uiSchema={uiSchema}
//       formData={{}}
//       onCancel={() => console.log("cancel")}
//       onSubmit={async (e) => console.log("submit", e)}
//     />,
//   );

//   const phoneField = screen.getByLabelText("Phone*");
//   const emailField = screen.getByLabelText("Email*");

//   // Invalid phone number
//   fireEvent.change(phoneField, { target: { value: "1234567" } });
//   // Invalid email
//   fireEvent.change(emailField, { target: { value: "test@tes" } });

//   expect(
//     screen.queryByTestId("section2-tasklist-check"),
//   ).toBeEmptyDOMElement();

//   // Valid phone number
//   fireEvent.change(phoneField, { target: { value: "12345678901" } });
//   // Valid email
//   fireEvent.change(emailField, { target: { value: "test@testing.ca" } });

//   expect(
//     screen.getByTestId("section2-tasklist-check"),
//   ).not.toBeEmptyDOMElement();
// });
