"use client";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { useState } from "react";
import { RJSFSchema } from "@rjsf/utils";
import { productionDataUiSchema } from "@reporting/src/data/jsonSchema/productionData";
import { ProductData } from "@bciers/types/form/productionData";
import { postProductionData } from "@bciers/actions/api";
import { NavigationInformation } from "../taskList/types";

interface Props {
  report_version_id: number;
  facility_id: string;
  allowedProducts: { product_id: number; product_name: string }[];
  initialData: ProductData[];
  schema: RJSFSchema;
  navigationInformation: NavigationInformation;
}

const ProductionDataForm: React.FC<Props> = ({
  report_version_id,
  facility_id,
  schema,
  allowedProducts,
  initialData,
  navigationInformation,
}) => {
  const initialFormData = {
    product_selection: initialData.map((i) => i.product_name),
    production_data: initialData,
  };

  const [formData, setFormData] = useState<any>(initialFormData);
  const [errors, setErrors] = useState<string[]>();

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
    const response = await postProductionData(
      report_version_id,
      facility_id,
      data.production_data,
    );

    if (response?.error) {
      setErrors([response.error]);
      return false;
    }

    setErrors(undefined);
    return true;
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={navigationInformation.headerStepIndex}
      steps={navigationInformation.headerSteps}
      taskListElements={navigationInformation.taskList}
      schema={schema}
      uiSchema={productionDataUiSchema}
      formData={formData}
      baseUrl={"#"}
      cancelUrl={"#"}
      backUrl={navigationInformation.backUrl}
      onSubmit={(data) => onSubmit(data.formData)}
      onChange={(data) => onChange(data.formData)}
      continueUrl={navigationInformation.continueUrl}
      errors={errors}
    />
  );
};

export default ProductionDataForm;
