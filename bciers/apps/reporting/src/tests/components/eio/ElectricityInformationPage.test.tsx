import { render } from "@testing-library/react";
import ElectricityInformationForm from "@reporting/src/app/components/eio/ElectricityInformationForm";
import { getElectricityImportData } from "@reporting/src/app/utils/getElectricityImportData";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import ElectricityInformationPage from "@reporting/src/app/components/eio/ElectricityInformationPage";
import { dummyNavigationInformation } from "@reporting/src/tests/components/taskList/utils";

vi.mock("@reporting/src/app/components/eio/ElectricityInformationForm", () => ({
  default: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getElectricityImportData", () => ({
  getElectricityImportData: vi.fn(),
}));

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

const mockElectricityInformationForm = ElectricityInformationForm as ReturnType<
  typeof vi.fn
>;
const mockGetElectricityImportData = getElectricityImportData as ReturnType<
  typeof vi.fn
>;
const mockGetNavigationInformation = getNavigationInformation as ReturnType<
  typeof vi.fn
>;

describe("ElectricityInformationPage component", () => {
  it("renders the ElectricityInformationForm component with the correct data", async () => {
    const mockVersionId = 56789;
    const mockInitialFormData = {
      import_specified_emissions: "0.0500",
      import_unspecified_electricity: "0.0500",
      import_unspecified_emissions: "0.0500",
      export_specified_electricity: "0.0500",
      export_specified_emissions: "0.0500",
      export_unspecified_electricity: "0.0500",
      export_unspecified_emissions: "0.0500",
      canadian_entitlement_electricity: "0.0500",
      canadian_entitlement_emissions: "0.0500",
    };

    mockGetElectricityImportData.mockResolvedValue(mockInitialFormData);
    mockGetNavigationInformation.mockResolvedValue(dummyNavigationInformation);

    render(await ElectricityInformationPage({ version_id: mockVersionId }));

    expect(mockGetElectricityImportData).toHaveBeenCalledWith(mockVersionId);
    expect(mockGetNavigationInformation).toHaveBeenCalledWith(
      "Report Information",
      "ElectricityImportData",
      mockVersionId,
      "",
      { isElectricityImport: true },
    );

    expect(mockElectricityInformationForm).toHaveBeenCalledWith(
      {
        versionId: mockVersionId,
        initialFormData: mockInitialFormData,
        navigationInformation: dummyNavigationInformation,
      },
      {},
    );
  });
});
