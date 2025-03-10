"use client";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { useState } from "react";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useEffect, useState } from "react";
import { RJSFSchema } from "@rjsf/utils";
import { productionDataUiSchema } from "@reporting/src/data/jsonSchema/productionData";
import { ProductData } from "@bciers/types/form/productionData";
import { postProductionData } from "@bciers/actions/api";
import { NavigationInformation } from "../taskList/types";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import DeselectAllButton from "./DeselectAllButton";
import { createRoot } from "react-dom/client";

interface ProductionDataItem {
  properties: {
    production_methodology: RJSFSchema;
  };
}

interface Props {
  report_version_id: number;
  facility_id: string;
  allowedProducts: { product_id: number; product_name: string }[];
  initialData: ProductData[];
  schema: RJSFSchema;
  navigationInformation: NavigationInformation;
  isPulpAndPaper: boolean;
  overlappingIndustrialProcessEmissions: number;
  facilityType: string;
}

const ProductionDataForm: React.FC<Props> = ({
  report_version_id,
  facility_id,
  schema,
  allowedProducts,
  initialData,
  navigationInformation,
  isPulpAndPaper,
  overlappingIndustrialProcessEmissions,
  facilityType,
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

  // User must select a product if facility type is not small or medium
  useEffect(() => {
    if (
      !["Small Aggregate", "Medium Facility"].includes(facilityType) &&
      formData.product_selection.length < 1
    ) {
      setErrors(["A product must be selected"]);
    } else setErrors(undefined);
  }, [formData]);

  // If facility type is small or medium, add not applicable as an option to production quantity
  const modifiedSchema = schema;
  if (modifiedSchema.definitions) {
    // From productionData.tsx
    const object = {
      title: "Production Quantification Methodology",
      type: "string",
      enum: ["OBPS Calculator", "other"],
      default: "OBPS Calculator",
    };
    if (["Small Aggregate", "Medium Facility"].includes(facilityType))
      object.enum.push("Not Applicable");
    const item = modifiedSchema.definitions
      .productionDataItem as ProductionDataItem;
    item.properties.production_methodology = object as RJSFSchema;
  }

  // Add button to deselect other checkboxes if small or medium
  useEffect(() => {
    const checkboxes = document.querySelector(".checkboxes");
    const div = document.createElement("div");
    if (
      ["Small Aggregate", "Medium Facility"].includes(facilityType) &&
      checkboxes
    ) {
      checkboxes.appendChild(div); // Add div to checkbox list
      const root = createRoot(div); // Make div root for react
      root.render(<DeselectAllButton />); // Render JSX button

      // The only way I found to avoid adding duplicates on page change with dev remounting
      setTimeout(() => {
        const buttons = document.querySelectorAll("#deselectButton");
        if (buttons.length > 1) {
          buttons[1].remove();
        }
      }, 10);
    }
  }, []);

  const onSubmit = async (data: any) => {
    /*
      Handle pulp & paper overlapping industrial process exception:
      If pulp & paper is reported and there are industrial process emissions that are also categorized as excluded (ie: woody biomass)
      Then the 'Pulp and paper: chemical pulp' product must be reported
    */
    if (isPulpAndPaper && overlappingIndustrialProcessEmissions > 0) {
      if (!data.product_selection.includes("Pulp and paper: chemical pulp")) {
        setErrors([
          "Missing Product: 'Pulp and paper: chemical pulp'. Please add the product on the operation review page",
        ]);
        return false;
      }
    }
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
      schema={modifiedSchema}
      uiSchema={productionDataUiSchema}
      formData={formData}
      baseUrl={"#"}
      cancelUrl={"#"}
      backUrl={navigationInformation.backUrl}
      onSubmit={(data) => onSubmit(data.formData)}
      onChange={(data) => onChange(data.formData)}
      continueUrl={navigationInformation.continueUrl}
      errors={errors}
      saveButtonDisabled={errors && errors.length > 0}
      submitButtonDisabled={errors && errors.length > 0}
    />
  );
};

export default ProductionDataForm;
