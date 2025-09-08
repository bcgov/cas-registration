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
  changes: DisplayChangeItem[];
  changeType: "added" | "modified" | "deleted";
  productData?: any;
}

// Helper to extract product name from field string
const getProductName = (field: string) => {
  const match = field.match(/\['report_products'\]\['([^']+)'\]/);
  return match ? match[1] : undefined;
};
// Helper to extract field key from field string
const getFieldKey = (field: string) => {
  const match = field.match(/\['report_products'\]\['[^']+'\]\['([^']+)'\]/);
  return match ? match[1] : undefined;
};
// Helper to determine change type and flags
const getChangeMeta = (
  change: ChangeItem,
): {
  changeType: "added" | "deleted" | "modified";
  isNewAddition: boolean;
  isDeletion: boolean;
} => {
  if (change.oldValue == null)
    return { changeType: "added", isNewAddition: true, isDeletion: false };
  if (change.newValue == null)
    return { changeType: "deleted", isNewAddition: false, isDeletion: true };
  return { changeType: "modified", isNewAddition: false, isDeletion: false };
};
export const ProductionDataChangeView: React.FC<
  ProductionDataChangeViewProps
> = ({ data }) => {
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

  // Process changes and group by product name
  const processChanges = (): ProcessedProduct[] => {
    const productGroups: Record<string, ProcessedProduct> = {};

    data.forEach((change) => {
      if (
        /\['report_products'\]$/.test(change.field) &&
        typeof change.oldValue === "object" &&
        typeof change.newValue === "object"
      ) {
        const oldProducts = (change.oldValue ?? {}) as Record<string, any>;
        const newProducts = (change.newValue ?? {}) as Record<string, any>;

        const allProductNames = new Set([
          ...Object.keys(oldProducts),
          ...Object.keys(newProducts),
        ]);

        allProductNames.forEach((productName) => {
          const oldProduct = oldProducts[productName];
          const newProduct = newProducts[productName];

          if (oldProduct && !newProduct) {
            // Product deleted
            productGroups[productName] = {
              productName,
              changes: [],
              changeType: "deleted",
              productData: oldProduct,
            };
          } else if (!oldProduct && newProduct) {
            productGroups[productName] = {
              productName,
              changes: [],
              changeType: "added",
              productData: newProduct,
            };
          } else if (oldProduct && newProduct) {
            const productChanges: DisplayChangeItem[] = [];
            Object.keys(fieldLabels).forEach((fieldKey) => {
              const oldVal = oldProduct[fieldKey];
              const newVal = newProduct[fieldKey];
              if (oldVal !== newVal) {
                const { changeType, isNewAddition, isDeletion } = getChangeMeta(
                  { ...change, oldValue: oldVal, newValue: newVal },
                );
                productChanges.push({
                  ...change,
                  field: `${change.field}['${productName}']['${fieldKey}']`,
                  displayLabel: fieldLabels[fieldKey],
                  oldValue: oldVal,
                  newValue: newVal,
                  change_type: changeType,
                  isNewAddition,
                  isDeletion,
                });
              }
            });

            if (productChanges.length > 0) {
              productGroups[productName] = {
                productName,
                changes: productChanges,
                changeType: "modified",
              };
            }
          }
        });
      } else {
        // Fallback: single field or product change
        const productName = getProductName(change.field);
        if (!productName) return;
        const { changeType, isNewAddition, isDeletion } = getChangeMeta(change);

        const fieldKey = getFieldKey(change.field);
        if (fieldKey && fieldLabels[fieldKey]) {
          if (!productGroups[productName]) {
            productGroups[productName] = {
              productName,
              changes: [],
              changeType: "modified",
            };
          }
          productGroups[productName].changes.push({
            ...change,
            displayLabel: fieldLabels[fieldKey],
            change_type: changeType,
            isNewAddition,
            isDeletion,
          });
        }
      }
    });

    return Object.values(productGroups);
  };

  const processedProducts = processChanges();

  if (processedProducts.length === 0) {
    return (
      <Box mb={4}>
        <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue mb-4">
          Production Data
        </Typography>
        <Typography color="textSecondary">No changes found.</Typography>
      </Box>
    );
  }

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue mb-4">
        Production Data
      </Typography>
      {processedProducts.map((product, productIndex) => (
        <React.Fragment key={`product-${product.productName}`}>
          {/* For full product changes (added/deleted), display in final review format */}
          {(product.changeType === "added" ||
            product.changeType === "deleted") &&
          product.productData ? (
            <Box mb={3}>
              <SectionReview
                data={product.productData}
                fields={productionDataFields(product.productData).map(
                  (field) =>
                    field.heading
                      ? {
                          ...field,
                          heading: (
                            <Box display="flex" alignItems="center" gap={1}>
                              <span>{field.heading}</span>
                              <StatusLabel type={product.changeType} />
                            </Box>
                          ),
                        }
                      : field,
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
                {(product.changeType === "added" ||
                  product.changeType === "deleted") && (
                  <Box mb={2}>
                    <StatusLabel type={product.changeType} />
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
