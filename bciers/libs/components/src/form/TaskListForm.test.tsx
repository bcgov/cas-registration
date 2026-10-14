import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import TaskListForm from "./TaskListForm";
import SectionHeaderFieldTemplate from "@bciers/components/form/fields/SectionHeaderFieldTemplate";
import { FormMode } from "@bciers/utils/src/enums";

const schema: RJSFSchema = {
  type: "object",
  required: ["first_name", "last_name", "phone", "email", "address", "city"],
  properties: {
    section_1_title: { type: "string", title: "Section 1" },
    first_name: { type: "string", title: "First name" },
    last_name: { type: "string", title: "Last name" },
    section_2_title: { type: "string", title: "Section 2" },
    phone: { type: "string", title: "Phone", format: "phone" },
    email: { type: "string", title: "Email", format: "email" },
    section_3_title: { type: "string", title: "Section 3" },
    address: { type: "string", title: "Address" },
    city: { type: "string", title: "City" },
  },
};

const uiSchema: UiSchema = {
  "ui:options": { label: false },
  section_1_title: { "ui:FieldTemplate": SectionHeaderFieldTemplate },
  section_2_title: { "ui:FieldTemplate": SectionHeaderFieldTemplate },
  phone: { "ui:widget": "PhoneWidget" },
  email: { "ui:widget": "EmailWidget" },
  section_3_title: { "ui:FieldTemplate": SectionHeaderFieldTemplate },
};

const mockFormData = {
  first_name: "Test",
  last_name: "User",
  phone: "+1234567890",
  email: "test@testing.ca",
  address: "123 Test St",
  city: "Victoria",
};

const noop = () => {
  // intentionally empty
};

describe("the TaskListForm component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("builds the task list from the section headings and renders them as headings", () => {
    render(
      <TaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={{}}
        onCancel={noop}
        onSubmit={async () => undefined}
      />,
    );

    ["Section 1", "Section 2", "Section 3"].forEach((title) => {
      expect(screen.getByRole("button", { name: title })).toBeVisible();
      expect(screen.getByRole("heading", { name: title })).toBeVisible();
    });

    expect(screen.getByLabelText("First name*")).toBeVisible();
    expect(screen.getByLabelText("Phone*")).toBeVisible();
    expect(screen.getByLabelText("City*")).toBeVisible();
  });

  it("submits the form data flat, without the data-less section headings", async () => {
    const mockOnSubmit = vi.fn();
    render(
      <TaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={mockFormData}
        mode={FormMode.READ_ONLY}
        onCancel={noop}
        onSubmit={async (e) => {
          mockOnSubmit(e.formData);
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(mockFormData);
    });
  });

  it("returns to read-only on a successful save and stays editable on an error", async () => {
    const { rerender } = render(
      <TaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={mockFormData}
        mode={FormMode.READ_ONLY}
        onCancel={noop}
        onSubmit={async () => ({ error: "boom" })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
    });

    rerender(
      <TaskListForm
        schema={schema}
        uiSchema={uiSchema}
        formData={mockFormData}
        mode={FormMode.READ_ONLY}
        onCancel={noop}
        onSubmit={async () => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit" })).toBeVisible();
    });
  });

  it("reports a required error on every missing field, even when a whole section is empty", () => {
    const mockOnSubmit = vi.fn();
    render(
      <TaskListForm
        schema={schema}
        uiSchema={uiSchema}
        // Section 3's fields are absent entirely, not empty strings
        formData={{ first_name: "Test", last_name: "User" }}
        onCancel={noop}
        onSubmit={async (e) => {
          mockOnSubmit(e.formData);
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getAllByText(/^.* is required/i)).toHaveLength(4);
    expect(screen.getByText("Address is required")).toBeVisible();
    expect(screen.getByText("City is required")).toBeVisible();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("renders without a task list when the schema declares no section headings", () => {
    render(
      <TaskListForm
        schema={{
          type: "object",
          properties: { first_name: { type: "string", title: "First name" } },
        }}
        uiSchema={{}}
        formData={{}}
        onCancel={noop}
        onSubmit={async () => undefined}
      />,
    );

    expect(screen.getByLabelText("First name")).toBeVisible();
    expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
  });
});
