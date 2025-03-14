import { render, screen, waitFor } from "@testing-library/react";
import PersonResponsiblePage from "@reporting/src/app/components/operations/personResponsible/PersonResponsiblePage"; // Adjust import path if needed
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { getContacts } from "@bciers/actions/api";
import { getReportingPersonResponsible } from "@reporting/src/app/utils/getReportingPersonResponsible";
import { createPersonResponsibleSchema } from "@reporting/src/app/components/operations/personResponsible/createPersonResponsibleSchema";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { dummyNavigationInformation } from "../../taskList/utils";

// Mock functions
vi.mock("@reporting/src/app/utils/getFacilityReport", () => ({
  getFacilityReport: vi.fn(),
}));
const mockGetFacilityReport = getFacilityReport as ReturnType<typeof vi.fn>;

vi.mock(
  "@reporting/src/app/components/taskList/1_operationInformation",
  () => ({
    getOperationInformationTaskList: vi.fn(),
    ActivePage: {
      PersonResponsible: "PersonResponsible",
    },
  }),
);

vi.mock("@bciers/actions/api", () => ({
  getContacts: vi.fn(),
}));
const mockGetContacts = getContacts as ReturnType<typeof vi.fn>;

vi.mock("@reporting/src/app/utils/getReportingPersonResponsible", () => ({
  getReportingPersonResponsible: vi.fn(),
}));
const mockGetReportingPersonResponsible =
  getReportingPersonResponsible as ReturnType<typeof vi.fn>;

vi.mock(
  "@reporting/src/app/components/operations/personResponsible/createPersonResponsibleSchema",
  () => ({
    createPersonResponsibleSchema: vi.fn(),
  }),
);
const mockCreatePersonResponsibleSchema =
  createPersonResponsibleSchema as ReturnType<typeof vi.fn>;

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));
const mockGetNavigationInformation = getNavigationInformation as ReturnType<
  typeof vi.fn
>;

// Mocks for the data
const mockFacilityReport = {
  facility_id: 123,
  operation_type: "Single Facility Operation",
};

const mockTaskListElements = [
  { type: "Page", title: "Person Responsible", isActive: true },
];
const mockContactData = {
  items: [{ id: 1, first_name: "John", last_name: "Doe" }],
  count: 1,
};
const mockPersonResponsibleData = { first_name: "John", last_name: "Doe" };
const mockSchema = { type: "object", properties: {} };

// Default props
const mockVersionId = 12345;

// Setting up the mock implementations
mockGetFacilityReport.mockResolvedValue(mockFacilityReport);
mockGetContacts.mockResolvedValue(mockContactData);
mockGetReportingPersonResponsible.mockResolvedValue(mockPersonResponsibleData);
mockCreatePersonResponsibleSchema.mockReturnValue(mockSchema);
mockGetNavigationInformation.mockResolvedValue({
  ...dummyNavigationInformation,
  taskList: mockTaskListElements,
});

describe("PersonResponsiblePage component", () => {
  it("renders the PersonResponsibleForm component with the correct data", async () => {
    render(await PersonResponsiblePage({ version_id: mockVersionId }));

    expect(mockGetFacilityReport).toHaveBeenCalledWith(mockVersionId);
    expect(mockGetReportingPersonResponsible).toHaveBeenCalledWith(
      mockVersionId,
    );
    expect(mockGetContacts).toHaveBeenCalledTimes(1);
    expect(mockCreatePersonResponsibleSchema).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText(/Person Responsible/)).toBeInTheDocument();
    });
  });
});
