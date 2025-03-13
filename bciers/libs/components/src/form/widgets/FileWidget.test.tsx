import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { useSession } from "@bciers/testConfig/mocks";
import { Session } from "@bciers/testConfig/types";
import { checkNoValidationErrorIsTriggered } from "@/tests/helpers/form";
import {
  downloadUrl,
  downloadUrl2,
  mock21MBFile,
  mockFile,
  mockFile2,
  mockFileUnaccepted,
} from "@bciers/testConfig/constants";

const fileFieldLabel = "FileWidget test field";
const fileLabelRequired = `${fileFieldLabel}*`;

const alertMock = vi.spyOn(window, "alert");

export const fileFieldSchema = {
  type: "object",
  required: ["fileTestField"],
  properties: {
    fileTestField: {
      type: "string",
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
    global.URL.createObjectURL = vi.fn(
      () => "this is the link to download the File",
    );
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

  it("should render the file value when formData is provided", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: downloadUrl,
        }}
        uiSchema={fileFieldUiSchema}
      />,
    );

    expect(screen.getByText("test.pdf")).toBeVisible();
  });

  it("should allow uploading a file", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    expect(screen.getByText("test.pdf")).toBeVisible();
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

    expect(screen.getByText("test.kml")).toBeVisible();

    await userEvent.upload(input, mockKmzFile);

    expect(screen.getByText("test.kmz")).toBeVisible();
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

    expect(screen.getByText("test.pdf")).toBeVisible();

    await userEvent.upload(input, mockFile2);

    expect(screen.getByText("test2.pdf")).toBeVisible();
  });

  it("should allow replacing an uploaded file after submission", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: downloadUrl,
        }}
        uiSchema={fileFieldUiSchema}
      />,
    );

    const input = screen.getByLabelText(fileLabelRequired);

    expect(screen.getByText("test.pdf")).toBeVisible();

    await userEvent.upload(input, mockFile2);

    expect(screen.getByText("test2.pdf")).toBeVisible();
  });

  it("should have the file download link when a file is uploaded", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);
    const input = screen.getByLabelText(fileLabelRequired);

    expect(
      screen.queryByRole("link", { name: "test.pdf" }),
    ).not.toBeInTheDocument();

    await userEvent.upload(input, mockFile);
    const previewLink = screen.getByRole("link", { name: "test.pdf" });
    expect(previewLink).toBeVisible();
    // mocked
    expect(previewLink).toHaveAttribute(
      "href",
      "this is the link to download the File",
    );
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
          fileTestField: downloadUrl,
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
              },
            },
          },
        }}
        formData={{
          fileTestField: [downloadUrl, downloadUrl2],
        }}
        uiSchema={fileFieldUiSchema}
      />,
    );

    await checkNoValidationErrorIsTriggered();
  });
});
