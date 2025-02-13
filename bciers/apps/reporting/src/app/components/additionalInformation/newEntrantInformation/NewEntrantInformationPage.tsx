import NewEntrantInformationForm from "./NewEntrantInformationForm";
import { getNewEntrantData } from "@reporting/src/app/utils/getNewEntrantData";
import { getAdditionalInformationTaskList } from "@reporting/src/app/components/taskList/3_additionalInformation";
import { ActivePage } from "@reporting/src/app/components/taskList/3_additionalInformation";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";

export default async function NewEntrantInformationPage({
  version_id,
}: HasReportVersion) {
  const newEntrantData = await getNewEntrantData(version_id);

  const { new_entrant_data: initialFormData } = newEntrantData;

  function transformEmissions(emissions: any[], naics_code: string) {
    const filteredEmissions = emissions?.filter((emission) => {
      if (
        emission.category_type === "other_excluded" &&
        naics_code !== "324110"
      ) {
        return false;
      }
      return !(
        naics_code === "324110" &&
        emission.category_type === "other_excluded" &&
        emission.category_name.toLowerCase().includes("fat, oil and grease")
      );
    });

    const groupedEmissions = filteredEmissions?.reduce((acc, emission) => {
      const categoryType = emission.category_type;

      if (!acc[categoryType]) {
        acc[categoryType] = {
          name: categoryType,
          title:
            categoryType === "basic"
              ? "Emission categories after new entrant period began"
              : categoryType === "fuel_excluded"
              ? "Emissions excluded by fuel type"
              : "Other emissions",
          emissionData: [],
        };
      }
      acc[categoryType].emissionData.push({
        id: emission.id,
        name: emission.category_name,
        emission: emission.emission,
      });

      return acc;
    }, {});

    return Object.values(groupedEmissions);
  }

  const formData = {
    ...initialFormData,
    products: newEntrantData.products,
    emissions: transformEmissions(
      newEntrantData.emissions,
      newEntrantData.naics_code,
    ),
  };

  const operationType = await getFacilityReport(version_id);
  const taskListElements = getAdditionalInformationTaskList(
    version_id,
    ActivePage.NewEntrantInformation,
    true,
    operationType?.operation_type,
  );

  return (
    <NewEntrantInformationForm
      version_id={version_id}
      initialFormData={formData}
      taskListElements={taskListElements}
    />
  );
}
