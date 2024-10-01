import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getAllRegulatedProducts } from "@reporting/src/app/utils/getAllRegulatedProducts";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { useEffect } from "react";

export const useTest = (
  formData: any,
  version_id: number,
  setFormSchema: Function,
  setFormUiSchema: Function,
  setFormData: Function,
) => {
  useEffect(() => {
    const updateSchema = async () => {
      const reportOperation = await getReportingOperation(version_id);
      const allActivities = await getAllActivities();
      const allRegulatedProducts = await getAllRegulatedProducts();
      const reportingYear = await getReportingYear();

      if (!formData || !allActivities || !allRegulatedProducts) {
        return;
      }

      const activities = formData.activities || [];
      const products = formData.regulated_products || [];

      setFormSchema((prevSchema) => ({
        ...prevSchema,
        properties: {
          ...prevSchema.properties,
          activities: {
            type: "array",
            title: "Reporting activities",
            items: {
              type: "number",
              enum: allActivities.map((activity) => activity.id),
              enumNames: allActivities.map((activity) => activity.name),
            },
            uniqueItems: true,
          },
          regulated_products: {
            type: "array",
            title: "Regulated products",
            items: {
              type: "number",
              enum: allRegulatedProducts.map((product) => product.id),
              enumNames: allRegulatedProducts.map((product) => product.name),
            },
            uniqueItems: true,
          },
          operation_representative_name: {
            type: "string",
            title: "Operation representative",
            enum: [formData.operation_representative_name || ""],
          },
          operation_type: {
            type: "string",
            title: "Operation type",
            enum: [formData.operation_type || ""],
          },
          date_info: {
            type: "object",
            readOnly: true,
            title: `Please ensure this information was accurate for`,
          },
        },
      }));

      const updatedFormData = {
        ...formData,
        activities,
        regulated_products: products,
      };

      setFormData(updatedFormData);
    };

    updateSchema();
  }, []);
};
