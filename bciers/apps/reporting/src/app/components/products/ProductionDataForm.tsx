"use client";

import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  buildProductionDataSchema,
  productionDataUiSchema,
} from "@reporting/src/data/jsonSchema/productionData";
import { Product, ProductData } from "./types";
import { useState } from "react";

interface Props {
  allowedProducts: Product[];
  initialData: ProductData[];
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

const ProductionDataForm: React.FC<Props> = ({ allowedProducts }) => {
  const [formData, setFormData] = useState<any>({});

  const schema: any = buildProductionDataSchema("Jan 1", "Dec 31");
  schema.properties.productSelection.items.enum = allowedProducts.map(
    (p) => p.name,
  );

  const onChange = (newFormData: {
    productSelection: string[];
    productionData: ProductData[];
  }) => {
    const updatedSelection = newFormData.productSelection.map(
      (product_name) =>
        newFormData.productionData.find(
          (item) => item.name === product_name,
        ) ?? { name: product_name },
    );

    setFormData({
      productSelection: newFormData.productSelection,
      productionData: updatedSelection,
    });
  };

  const onSubmit = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(data);
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
