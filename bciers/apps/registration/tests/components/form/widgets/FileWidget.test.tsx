import { userEvent } from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@/app/components/form/FormBase";
import { actionHandler, useSession } from "@/tests/setup/mocks";
import { Session } from "@/tests/setup/types";

const fileFieldLabel = "FileWidget test field";
const fileLabelRequired = `${fileFieldLabel}*`;
export const dummyDataUri =
  "data:application/pdf;name=dummy.pdf;base64,ZHVtbXk=";
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
    "ui:options": { accept: ".pdf" },
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
  });

  it("should render the file value when formData is provided", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: dummyDataUri,
        }}
        uiSchema={fileFieldUiSchema}
      />,
    );

    expect(screen.getByText("dummy.pdf")).toBeVisible();
  });

  it("should allow uploading a file", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    actionHandler.mockResolvedValueOnce({});

    expect(screen.getByText("test.pdf")).toBeVisible();
  });

  it("should not allow uploading a file with an unaccepted file type", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFileUnaccepted);

    expect(screen.getByText("No attachment was uploaded")).toBeVisible();

    // add accepted file type
    await userEvent.upload(input, mockFile);
    expect(screen.getByText("test.pdf")).toBeVisible();
    expect(
      screen.queryByText("No attachment was uploaded"),
    ).not.toBeInTheDocument();
  });

  it("should change the upload button text when a file is uploaded", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    actionHandler.mockResolvedValueOnce({});

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

    actionHandler.mockResolvedValueOnce({});

    expect(screen.getByText("test.kml")).toBeVisible();

    await userEvent.upload(input, mockKmzFile);

    actionHandler.mockResolvedValueOnce({});

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

  it("should allow replacing an uploaded file", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    actionHandler.mockResolvedValueOnce({});

    expect(screen.getByText("test.pdf")).toBeVisible();

    await userEvent.upload(input, mockFile2);

    actionHandler.mockResolvedValueOnce({});

    expect(screen.getByText("test2.pdf")).toBeVisible();
  });

  it("should display the file preview link when a file is uploaded", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);
    const input = screen.getByLabelText(fileLabelRequired);

    const previewLink = screen.queryByRole("link", { name: "Preview" });
    expect(previewLink).not.toBeInTheDocument();

    await userEvent.upload(input, mockFile);

    actionHandler.mockResolvedValueOnce({});

    waitFor(() => {
      expect(previewLink).toBeVisible();
    });
  });

  it("should have the correct href for the preview link", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    waitFor(() => {
      const previewLink = screen.getByRole("link", { name: "Preview" });
      expect(previewLink).toHaveAttribute("href", dummyDataUri);
    });
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
});
