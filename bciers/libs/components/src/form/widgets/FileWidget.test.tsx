import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { useSession } from "@bciers/testConfig/mocks";
import { Session } from "@bciers/testConfig/types";
import { checkNoValidationErrorIsTriggered } from "@/tests/helpers/form";

const fileFieldLabel = "FileWidget test field";
const fileLabelRequired = `${fileFieldLabel}*`;
export const testDataUriClean =
  "data:application/pdf;name=testpdf.pdf;scanstatus=Clean;base64,ZHVtbXk=";
export const testDataUriUnscanned =
  "data:application/pdf;name=testpdf.pdf;scanstatus=Unscanned;base64,ZHVtbXk=";
export const testDataUriQuarantined =
  "data:application/pdf;name=testpdf.pdf;scanstatus=Quarantined;base64,ZHVtbXk=";
export const testDataUri2 =
  "data:application/pdf;name=testpdf2.pdf;scanstatus=Clean;base64,ZHVtbXk=";
const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });
const mockFile2 = new File(["test2"], "test2.pdf", { type: "application/pdf" });
const mockFileUnaccepted = new File(["test"], "test.txt", {
  type: "text/plain",
});

const mock21MBFile = new File(["test".repeat(20000000)], "test.pdf", {
  type: "application/pdf",
});

const alertMock = vi.spyOn(window, "alert");

export const fileFieldSchema = {
  type: "object",
  required: ["fileTestField"],
  properties: {
    fileTestField: {
      type: "string",
      format: "data-url",
      title: fileFieldLabel,
    },
  },
} as RJSFSchema;

export const fileFieldUiSchema = {
  fileTestField: {
    "ui:widget": "FileWidget",
    "ui:options": { accept: ".pdf", filePreview: true },
  },
};

describe("RJSF FileWidget", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "industry_user_admin",
        },
      },
    } as Session);
  });

  it("should render a file field", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);
    // Using toBeInTheDocument() instead of toBeVisible() because the file input is hidden
    expect(screen.getByLabelText(fileLabelRequired)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload attachment" }),
    ).toBeVisible();
    expect(screen.getByText("No attachment was uploaded")).toBeVisible();
    expect(screen.queryByRole("input")).not.toBeInTheDocument();
  });

  it("should render the scanning message when formData is provided and scanStatus is Unscanned", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: testDataUriUnscanned,
        }}
        uiSchema={fileFieldUiSchema}
      />,
    );

    expect(screen.getByText("Upload in progress....")).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "testpdf.pdf",
    );
  });

  it("should render the quarantine message when formData is provided and scanStatus is Quarantined", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: testDataUriQuarantined,
        }}
        uiSchema={fileFieldUiSchema}
      />,
    );

    expect(
      screen.getByText(
        "Security risk found. Check for viruses or upload a different file.",
      ),
    ).toBeVisible();
  });

  it("should render the file value when formData is provided and scanStatus is Clean", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: testDataUriClean,
        }}
        uiSchema={fileFieldUiSchema}
      />,
    );

    expect(screen.getByText("testpdf.pdf")).toBeVisible();
  });

  it("should allow uploading a file", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    expect(screen.getByText("Upload in progress....")).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test.pdf",
    );
    expect(
      screen.queryByText("No attachment was uploaded"),
    ).not.toBeInTheDocument();
  });

  it("should not allow uploading a file with an unaccepted file type", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFileUnaccepted);

    expect(screen.getByText("No attachment was uploaded")).toBeVisible();
  });

  it("should change the upload button text when a file is uploaded", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    expect(
      screen.getByRole("button", { name: "Reupload attachment" }),
    ).toBeVisible();
  });

  it("supports file formats such as .kml and .kmz", async () => {
    const mockFileFieldUiSchema = {
      fileTestField: {
        "ui:widget": "FileWidget",
        "ui:options": { accept: ".kml,.kmz" },
      },
    };
    render(
      <FormBase schema={fileFieldSchema} uiSchema={mockFileFieldUiSchema} />,
    );

    const input = screen.getByLabelText(fileLabelRequired);
    const mockKmlFile = new File(["test"], "test.kml", {
      type: "application/vnd.google-earth.kml+xml",
    });
    const mockKmzFile = new File(["test"], "test.kmz", {
      type: "application/vnd.google-earth.kmz",
    });

    await userEvent.upload(input, mockKmlFile);
    expect(screen.getByText("Upload in progress....")).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test.kml",
    );

    await userEvent.upload(input, mockKmzFile);
    expect(screen.getByText("Upload in progress....")).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test.kmz",
    );
  });

  it("should not allow uploading a file larger than 20MB", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mock21MBFile);

    expect(screen.getByText("No attachment was uploaded")).toBeVisible();
  });

  it("should display the alert when a file larger than 20MB is uploaded", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mock21MBFile);

    expect(alertMock).toHaveBeenCalledWith("File size must be less than 20MB");
  });

  it("should allow replacing an uploaded file before submission", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    expect(screen.getByText("Upload in progress....")).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test.pdf",
    );

    await userEvent.upload(input, mockFile2);

    expect(screen.getByText("Upload in progress....")).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test2.pdf",
    );
  });

  it("should allow replacing an uploaded file after submission", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: testDataUriClean,
        }}
        uiSchema={fileFieldUiSchema}
      />,
    );

    const input = screen.getByLabelText(fileLabelRequired);

    expect(screen.getByText("testpdf.pdf")).toBeVisible();

    await userEvent.upload(input, mockFile2);

    expect(screen.getByText("Upload in progress....")).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test2.pdf",
    );
  });

  it("should display the file preview link when a file is uploaded", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);
    const input = screen.getByLabelText(fileLabelRequired);

    expect(
      screen.queryByRole("link", { name: "Preview" }),
    ).not.toBeInTheDocument();

    await userEvent.upload(input, mockFile);
    expect(screen.getByRole("link", { name: "Preview" })).toBeVisible();
  });

  it("should have the correct href for the preview link", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formData={{
          fileTestField: [testDataUriClean],
        }}
      />,
    );
    const previewLink = screen.getByRole("link", { name: "Preview" });
    expect(previewLink).toHaveAttribute("href", testDataUriClean);
  });

  it("should not render the upload button for internal users", () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "cas_admin",
        },
      },
    } as Session);

    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    expect(
      screen.queryByRole("button", { name: "Upload attachment" }),
    ).not.toBeInTheDocument();
  });

  it("should show the validation error message if file is not uploaded", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText("Required field")).toBeVisible();
  });

  it("should not trigger an error if the data is valid", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: testDataUriClean,
        }}
        uiSchema={fileFieldUiSchema}
      />,
    );

    await checkNoValidationErrorIsTriggered();
  });

  // Note: our db is not set up to accept multiple files
  it("allows uploading multiple files if the schema allows multiple files", async () => {
    render(
      <FormBase
        schema={{
          type: "object",
          required: ["fileTestField"],
          properties: {
            fileTestField: {
              type: "array",
              title: "Multiple files",
              items: {
                type: "string",
                format: "data-url",
              },
            },
          },
        }}
        formData={{
          fileTestField: [testDataUriClean, testDataUri2],
        }}
        uiSchema={fileFieldUiSchema}
      />,
    );

    await checkNoValidationErrorIsTriggered();
  });
});
