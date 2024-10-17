"use client";

import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

import { useState } from "react";
import { RJSFSchema } from "@rjsf/utils";
import { productionDataUiSchema } from "@reporting/src/data/jsonSchema/productionData";
import { Product, ProductData } from "@bciers/types/form/productionData";
import { postProductionData } from "@bciers/actions/api";

interface Props {
  report_version_id: number;
  facility_id: string;
  allowedProducts: Product[];
  initialData: ProductData[];
  schema: RJSFSchema;
}

const taskListElements: TaskListElement[] = [
  {
    type: "Section",
    title: "Schmorg",
    isExpanded: true,
    elements: [
      {
        type: "Page",
        title: "Sborg",
        isChecked: true,
      },
      { type: "Page", title: "Sbarg", isActive: true },
      { type: "Page", title: "Shimilimili" },
    ],
  },
];

const ProductionDataForm: React.FC<Props> = ({
  report_version_id,
  facility_id,
  schema,
  allowedProducts,
}) => {
  const [formData, setFormData] = useState<any>({});

  const onChange = (newFormData: {
    product_selection: string[];
    production_data: ProductData[];
  }) => {
    const updatedSelection = newFormData.product_selection.map(
      (product_name) =>
        newFormData.production_data.find(
          (item) => item.name === product_name,
        ) ?? allowedProducts.find((p) => p.name === product_name),
    );

    setFormData({
      product_selection: newFormData.product_selection,
      production_data: updatedSelection,
    });
  };

  const onSubmit = async (data: any) => {
    console.log(data);
    await postProductionData(
      report_version_id,
      facility_id,
      data.production_data,
    );
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={0}
      steps={[
        "Operation Information",
        "Facilities Information",
        "Compliance Summary",
        "Sign-off & Submit",
      ]}
      taskListElements={taskListElements}
      schema={schema}
      uiSchema={productionDataUiSchema}
      formData={formData}
      baseUrl={"#"}
      cancelUrl={"#"}
      onSubmit={(data) => onSubmit(data.formData)}
      onChange={(data) => onChange(data.formData)}
    />
  );
};

export default ProductionDataForm;
