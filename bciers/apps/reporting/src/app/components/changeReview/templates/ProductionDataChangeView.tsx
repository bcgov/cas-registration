import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import { ChangeItem } from "../constants/types";
import { SectionReview } from "../../finalReview/templates/SectionReview";
import { productionDataFields } from "../../finalReview/finalReviewFields";
import { StatusLabel } from "@bciers/components/form/fields/StatusLabel";

interface DisplayChangeItem extends ChangeItem {
  displayLabel: string;
  isNewAddition?: boolean;
  isDeletion?: boolean;
}

interface ProductionDataChangeViewProps {
  data: ChangeItem[];
}

interface ProcessedProduct {
  productName: string;
  productIndex: number;
  changes: DisplayChangeItem[];
  changeType: "added" | "modified" | "deleted";
  productData?: any;
}

export const ProductionDataChangeView: React.FC<
  ProductionDataChangeViewProps
> = ({ data }) => {
  // Field labels mapping based on productionDataFields
  const fieldLabels: Record<string, string> = {
    product: "Product",
    unit: "Unit",
    annual_production: "Annual Production",
    production_data_apr_dec: "Production Data for Apr 1 - Dec 31 2024",
    production_methodology: "Production Quantification Methodology",
    production_methodology_description: "Production Methodology Description",
    storage_quantity_start_of_period:
      "Quantity in storage at the beginning of the compliance period [Jan 1], if applicable",
    storage_quantity_end_of_period:
      "Quantity in storage at the end of the compliance period [Dec 31], if applicable",
    quantity_sold_during_period:
      "Quantity sold during compliance period [Jan 1 - Dec 31], if applicable",
    quantity_throughput_during_period:
      "Quantity of throughput at point of sale during compliance period [Jan 1 - Dec 31], if applicable",
  };

  // Process changes and group by product
  const processChanges = (): ProcessedProduct[] => {
    const productGroups: Record<number, ProcessedProduct> = {};

    data.forEach((change) => {
      // Extract product index from the path: root['facility_reports'][Facility Name]['report_products'][1]
      let productIndex = 0;
      let isFullProductChange = false;

      const productIndexMatch = change.field.match(
        /report_products']\[(\d+)]$/,
      );
      const fieldMatch = change.field.match(
        /report_products']\[(\d+)']\['([^']+)/,
      );

      if (productIndexMatch) {
        // This is a full product add/delete/modify
        productIndex = parseInt(productIndexMatch[1]);
        isFullProductChange = true;
      } else if (fieldMatch) {
        // This is a specific field change within a product
        productIndex = parseInt(fieldMatch[1]);
        isFullProductChange = false;
      }

      if (isFullProductChange) {
        // Handle full product changes (added/deleted/modified products)
        const productData = change.new_value || change.old_value;
        const productName =
          (typeof productData === "object" && productData?.product) ||
          `Product ${productIndex + 1}`;

        // Determine change type based on old and new values
        let changeType: "added" | "modified" | "deleted" = "modified";
        if (change.old_value === null || change.old_value === undefined) {
          changeType = "added";
        } else if (
          change.new_value === null ||
          change.new_value === undefined
        ) {
          changeType = "deleted";
        }

        if (!productGroups[productIndex]) {
          productGroups[productIndex] = {
            productName,
            productIndex,
            changes: [],
            changeType,
            productData,
          };
        }

        // Create individual field changes for display
        const dataToProcess =
          changeType === "deleted" ? change.old_value : change.new_value;
        if (dataToProcess && typeof dataToProcess === "object") {
          Object.entries(dataToProcess).forEach(([fieldKey]) => {
            if (fieldLabels[fieldKey]) {
              const displayLabel = fieldLabels[fieldKey];

              productGroups[productIndex].changes.push({
                ...change,
                field: `${change.field}.${fieldKey}`,
                displayLabel,
                old_value:
                  changeType === "added"
                    ? null
                    : typeof change.old_value === "object"
                    ? change.old_value?.[fieldKey]
                    : null,
                new_value:
                  changeType === "deleted"
                    ? null
                    : typeof change.new_value === "object"
                    ? change.new_value?.[fieldKey]
                    : null,
                change_type: changeType,
                isNewAddition: changeType === "added",
                isDeletion: changeType === "deleted",
              } as DisplayChangeItem);
            }
          });
        }
      } else if (fieldMatch) {
        // Handle individual field changes
        const fieldKey = fieldMatch[2];

        if (fieldLabels[fieldKey]) {
          const displayLabel = fieldLabels[fieldKey];

          // Get product name from the data
          const productData = change.new_value || change.old_value;
          const productName =
            (typeof productData === "object" && productData?.product) ||
            `Product ${productIndex + 1}`;

          // Determine change type based on old and new values
          let changeType: "added" | "modified" | "deleted" = "modified";
          let isNewAddition = false;
          let isDeletion = false;

          if (change.old_value === null || change.old_value === undefined) {
            changeType = "added";
            isNewAddition = true;
          } else if (
            change.new_value === null ||
            change.new_value === undefined
          ) {
            changeType = "deleted";
            isDeletion = true;
          }

          if (!productGroups[productIndex]) {
            productGroups[productIndex] = {
              productName,
              productIndex,
              changes: [],
              changeType: "modified",
            };
          }

          productGroups[productIndex].changes.push({
            ...change,
            displayLabel,
            change_type: changeType,
            isNewAddition,
            isDeletion,
          } as DisplayChangeItem);
        }
      }
    });

    return Object.values(productGroups).sort(
      (a, b) => a.productIndex - b.productIndex,
    );
  };

  const processedProducts = processChanges();

  if (processedProducts.length === 0) {
    return null;
  }

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue mb-4">
        Production Data
      </Typography>

      {processedProducts.map((product, productIndex) => (
        <React.Fragment key={`product-${product.productIndex}`}>
          {/* For full product changes (added/deleted), display in final review format */}
          {(product.changeType === "added" ||
            product.changeType === "deleted") &&
          product.productData ? (
            <Box mb={3}>
              <SectionReview
                data={product.productData}
                fields={productionDataFields(product.productData).map(
                  (field) => {
                    // Modify the heading field to include StatusLabel
                    if (field.heading) {
                      return {
                        ...field,
                        heading: (
                          <Box display="flex" alignItems="center" gap={1}>
                            <span>{field.heading}</span>
                            <StatusLabel
                              type={
                                product.changeType === "deleted"
                                  ? "deleted"
                                  : "added"
                              }
                            />
                          </Box>
                        ),
                      };
                    }
                    return field;
                  },
                )}
                isAdded={product.changeType === "added"}
                isDeleted={product.changeType === "deleted"}
              />
            </Box>
          ) : (
            /* For modified products or individual field changes, display as before */
            <>
              <Box mb={2}>
                <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-2">
                  {product.productName}
                </Typography>

                {/* Show StatusLabel for individual field changes that are added */}
                {product.changes.some((change) => change.isNewAddition) && (
                  <Box mb={2}>
                    <StatusLabel type="added" />
                  </Box>
                )}
              </Box>

              {product.changes.map((change, changeIndex) => (
                <ChangeItemDisplay
                  key={`${change.field}-${changeIndex}`}
                  item={change}
                />
              ))}
            </>
          )}

          {/* Add separator between products except for the last one */}
          {productIndex < processedProducts.length - 1 && (
            <Divider sx={{ my: 3 }} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};
