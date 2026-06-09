"use client";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { useState } from "react";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { buildProductionDataUiSchema } from "@reporting/src/data/jsonSchema/productionData";
import { ProductData } from "@reporting/src/app/components/products/types";
import { postProductionData } from "@reporting/src/app/utils/productDataForm/postProductionData";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import {
  FieldTemplate,
  TitleOnlyFieldTemplate,
} from "@bciers/components/form/fields";
import { createFormContext } from "../shared/formContextHelpers";
import NoRegulatedProductsAlertFieldTemplate from "@reporting/src/data/jsonSchema/facility/NoRegulatedProductsAlertFieldTemplate";

interface Props {
  report_version_id: number;
  facility_id: string;
  facilityType: string;
  reportingYear: number;
  allowedProducts: { product_id: number; product_name: string }[];
  initialData: ProductData[];
  schema: RJSFSchema;
  navigationInformation: NavigationInformation;
  isPulpAndPaper: boolean;
  overlappingIndustrialProcessEmissions: number;
  isOptedOut: boolean;
}

const ProductionDataForm: React.FC<Props> = ({
  report_version_id,
  facility_id,
  facilityType,
  reportingYear,
  allowedProducts,
  schema,
  initialData,
  navigationInformation,
  isPulpAndPaper,
  overlappingIndustrialProcessEmissions,
  isOptedOut = false,
}) => {
  const initialFormData = {
    product_selection: initialData.map((i) => i.product_name),
    production_data: initialData,
  };

  const noRegulatedProductSchema: RJSFSchema = {
    type: "object",
    title: "Production Data",
    properties: {
      product_selection_title: {
        title: "No Regulated Products to select",
        type: "string",
      },
    },
  };

  const noRegulatedProductUiSchema: UiSchema = {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "form-heading-label",
    product_selection_title: {
      "ui:FieldTemplate": TitleOnlyFieldTemplate,
      "ui:classNames": "mt-2 mb-5 emission-array-header",
    },
  };

  const noRegulatedProductSFOSchema: RJSFSchema = {
    type: "object",
    title: "Production Data",
    properties: {
      no_regulated_products_alert: {
        type: "object",
        readOnly: true,
      },
    },
  };

  const noRegulatedProductSFOUiSchema: UiSchema = {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "form-heading-label",
    no_regulated_products_alert: {
      "ui:FieldTemplate": NoRegulatedProductsAlertFieldTemplate,
    },
  };

  const [formData, setFormData] = useState<any>(initialFormData);
  const [errors, setErrors] = useState<string[]>();

  // No regulated product short circuits
  if (allowedProducts.length < 1) {
    // Short circuit to allow LFO facilities to continue past this form without a regulated product to select
    if (
      ["Small Aggregate", "Medium Facility", "Large Facility"].includes(
        facilityType,
      )
    ) {
      return (
        <MultiStepFormWithTaskList
          taskListElements={navigationInformation.taskList}
          schema={noRegulatedProductSchema}
          uiSchema={noRegulatedProductUiSchema}
          formData={formData}
          backUrl={navigationInformation.backUrl}
          continueUrl={navigationInformation.continueUrl}
          steps={navigationInformation.headerSteps}
          initialStep={navigationInformation.headerStepIndex}
          saveButtonDisabled={true}
        />
      );
    } else {
      // Short circuit to show error message for SFO facilities that have no regulated products
      return (
        <MultiStepFormWithTaskList
          taskListElements={navigationInformation.taskList}
          schema={noRegulatedProductSFOSchema}
          uiSchema={noRegulatedProductSFOUiSchema}
          formData={formData}
          backUrl={navigationInformation.backUrl}
          continueUrl={navigationInformation.continueUrl}
          steps={navigationInformation.headerSteps}
          initialStep={navigationInformation.headerStepIndex}
          errors={[]}
          saveButtonDisabled={true}
          submitButtonDisabled={true}
          formContext={{
            no_regulated_products_alert: {
              report_version_id,
            },
          }}
        />
      );
    }
  }

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
    if (
      !["Small Aggregate", "Medium Facility", "Large Facility"].includes(
        facilityType,
      ) &&
      formData.product_selection.length < 1
    ) {
      setErrors(["A product must be selected."]);
      return false;
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
      key={formData?.product_selection?.length || 999}
      initialStep={navigationInformation.headerStepIndex}
      steps={navigationInformation.headerSteps}
      taskListElements={navigationInformation.taskList}
      schema={schema}
      uiSchema={buildProductionDataUiSchema(reportingYear, isOptedOut)}
      formData={formData}
      formContext={createFormContext(formData)}
      baseUrl={"#"}
      cancelUrl={"#"}
      backUrl={navigationInformation.backUrl}
      onSubmit={(data: any, _navigateAfterSubmit: boolean) =>
        onSubmit((data as any).formData)
      }
      onChange={(data: any) => onChange((data as any).formData)}
      continueUrl={navigationInformation.continueUrl}
      errors={errors}
    />
  );
};

export default ProductionDataForm;
