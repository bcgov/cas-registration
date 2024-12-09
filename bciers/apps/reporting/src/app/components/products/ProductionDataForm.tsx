"use client";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useState } from "react";
import { RJSFSchema } from "@rjsf/utils";
import { productionDataUiSchema } from "@reporting/src/data/jsonSchema/productionData";
import { ProductData } from "@bciers/types/form/productionData";
import { postProductionData } from "@bciers/actions/api";
import { multiStepHeaderSteps } from "../taskList/multiStepHeaderConfig";
import { useRouter } from "next/navigation";

interface Props {
  report_version_id: number;
  facility_id: string;
  allowedProducts: { product_id: number; product_name: string }[];
  initialData: ProductData[];
  schema: RJSFSchema;
  taskListElements: TaskListElement[];
}

const ProductionDataForm: React.FC<Props> = ({
  report_version_id,
  facility_id,
  schema,
  allowedProducts,
  initialData,
  taskListElements,
}) => {
  const router = useRouter();

  const saveAndContinueUrl = `reports/${report_version_id}/facilities/${facility_id}/allocation-of-emissions`;

  const initialFormData = {
    product_selection: initialData.map((i) => i.product_name),
    production_data: initialData,
  };

  const [formData, setFormData] = useState<any>(initialFormData);

  const onChange = (newFormData: {
    product_selection: string[];
    production_data: ProductData[];
  }) => {
    const updatedSelection = newFormData.product_selection.map(
      (product_name) =>
        newFormData.production_data.find(
          (item) => item.product_name === product_name,
        ) ?? allowedProducts.find((p) => p.product_name === product_name),
    );

    setFormData({
      product_selection: newFormData.product_selection,
      production_data: updatedSelection,
    });
  };

  const onSubmit = async (data: any) => {
    await postProductionData(
      report_version_id,
      facility_id,
      data.production_data,
    );

    router.push(saveAndContinueUrl);
  };

  const backURL = `/reports/${report_version_id}/facilities/${facility_id}/emission-summary`;
  const continueURL = `/reports/${report_version_id}/facilities/${facility_id}/allocation-of-emissions`; // Update when page complete

  return (
    <MultiStepFormWithTaskList
      initialStep={1}
      steps={multiStepHeaderSteps}
      taskListElements={taskListElements}
      schema={schema}
      uiSchema={productionDataUiSchema}
      formData={formData}
      baseUrl={"#"}
      cancelUrl={"#"}
      onSubmit={(data) => onSubmit(data.formData)}
      onChange={(data) => onChange(data.formData)}
      backUrl={backURL}
      continueUrl={continueURL}
    />
  );
};

export default ProductionDataForm;
