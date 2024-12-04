import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import NewEntrantInformationForm from "./NewEntrantInformationForm";
import { getNewEntrantData } from "@reporting/src/app/utils/getNewEntrantData";

export default async function NewEntrantInformation({
  versionId,
}: {
  versionId: number;
}) {
  const newEntrantData = await getNewEntrantData(versionId);

  const { new_entrant_data: initialFormData } = newEntrantData;

  const formData = {
    ...initialFormData,
    products: newEntrantData.products,
    emissions: newEntrantData.emissions,
  };
  // formData.emissions = [
  //   {
  //     name: "basic",
  //     title: "Emission categories after new entrant period began",
  //     emissionData: [
  //       {
  //         id: 1,
  //         name: "Flaring emissions",
  //         emission: 123,
  //       },
  //       {
  //         id: 2,
  //         name: "Fugitive emissions",
  //       },
  //       {
  //         id: 3,
  //         name: "Industrial process emissions",
  //       },
  //       {
  //         id: 4,
  //         name: "On-site transportation emissions",
  //       },
  //       {
  //         id: 5,
  //         name: "Stationary fuel combustion emissions",
  //       },
  //       {
  //         id: 6,
  //         name: "Venting emissions — useful",
  //       },
  //       {
  //         id: 7,
  //         name: "Venting emissions — non-useful",
  //       },
  //       {
  //         id: 8,
  //         name: "Emissions from waste",
  //       },
  //       {
  //         id: 9,
  //         name: "Emissions from wastewater",
  //       },
  //     ],
  //   },
  //   {
  //     name: "fuel_excluded",
  //     title: "Emissions excluded by fuel type",
  //     emissionData: [
  //       {
  //         id: 10,
  //         name: "CO2 emissions from excluded woody biomass",
  //       },
  //       {
  //         id: 11,
  //         name: "Other emissions from excluded biomass",
  //       },
  //       {
  //         id: 12,
  //         name: "Emissions from excluded non-biomass",
  //       },
  //     ],
  //   },
  //   {
  //     name: "other_excluded",
  //     title: "Other excluded emissions",
  //     emissionData: [
  //       {
  //         id: 13,
  //         name: "Emissions from line tracing and non-processing and non-compression activities",
  //       },
  //       {
  //         id: 14,
  //         name: "Emissions from fat, oil and grease collection, refining and storage",
  //       },
  //     ],
  //   },
  // ];

  return (
    <Suspense fallback={<Loading />}>
      <NewEntrantInformationForm
        versionId={versionId}
        initialFormData={formData}
      />
    </Suspense>
  );
}
