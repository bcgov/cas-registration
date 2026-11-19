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
import NoRegulatedProductsAlertFieldTemplate from "@reporting/src/data/jsonSchema/facility/NoRegulatedProductsAlertFieldTemplate";
import { createFormContext } from "@reporting/src/app/components/shared/formContextHelpers";
import {
  useValidationErrors,
  handleApiResponse,
  setClientError,
} from "@bciers/components/validationErrors";

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
  const isLfoFacility = [
    "Small Aggregate",
    "Medium Facility",
    "Large Facility",
  ].includes(facilityType);

  // We select all products:
  // - either if the facility is not an LFO
  // - or if the facility is an LFO but nothing has been selected before (assuming first visit)
  const selectedProductionData =
    isLfoFacility && initialData.length > 0
      ? initialData
      : allowedProducts.map(
          (product) =>
            initialData.find(
              (item) => item.product_name === product.product_name,
            ) ?? product,
        );

  const initialFormData = {
    product_selection: selectedProductionData.map((i) => i.product_name),
    production_data: selectedProductionData,
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
  const { setErrors, renderedErrors } = useValidationErrors();

  // No regulated product short circuits
  if (allowedProducts.length < 1) {
    // Short circuit to allow LFO facilities to continue past this form without a regulated product to select
    if (isLfoFacility) {
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
    const productSelection = isLfoFacility
      ? newFormData.product_selection
      : initialFormData.product_selection;
    const updatedSelection = productSelection.map(
      (product_name) =>
        newFormData.production_data.find(
          (item) => item.product_name === product_name,
        ) ?? allowedProducts.find((p) => p.product_name === product_name),
    );
    if (productSelection.length > 0) {
      setErrors(undefined);
    }
    setFormData({
      product_selection: productSelection,
      production_data: updatedSelection,
    });
  };

  const onSubmit = async (data: any) => {
    setErrors(undefined);
    /*
      Handle pulp & paper overlapping industrial process exception:
      If pulp & paper is reported and there are industrial process emissions that are also categorized as excluded (ie: woody biomass)
      Then the 'Pulp and paper: chemical pulp' product must be reported
    */
    if (isPulpAndPaper && overlappingIndustrialProcessEmissions > 0) {
      if (!data.product_selection.includes("Pulp and paper: chemical pulp")) {
        return setClientError(
          "Missing Product: 'Pulp and paper: chemical pulp'. Please add the product on the operation review page.",
          setErrors,
        );
      }
    }
    if (!isLfoFacility && formData.product_selection.length < 1) {
      return setClientError("A product must be selected.", setErrors);
    }
    const response = await postProductionData(
      report_version_id,
      facility_id,
      data.production_data,
    );

    return handleApiResponse(response, setErrors);
  };

  const uiSchema = buildProductionDataUiSchema(reportingYear, isOptedOut);
  if (!isLfoFacility) {
    uiSchema.product_selection_title = { "ui:widget": "hidden" };
    uiSchema.product_selection = { "ui:widget": "hidden" };
  }

  return (
    <MultiStepFormWithTaskList
      key={formData?.product_selection?.length || 999}
      initialStep={navigationInformation.headerStepIndex}
      steps={navigationInformation.headerSteps}
      taskListElements={navigationInformation.taskList}
      schema={schema}
      uiSchema={uiSchema}
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
      submitButtonDisabled={
        formData.product_selection.length <= 0 && !isLfoFacility
      }
      errors={renderedErrors}
    />
  );
};

export default ProductionDataForm;
