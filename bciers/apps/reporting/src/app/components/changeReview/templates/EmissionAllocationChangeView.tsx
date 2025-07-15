import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import { ChangeItem } from "../constants/types";

interface DisplayChangeItem extends ChangeItem {
  displayLabel: string;
  isNewAddition?: boolean;
}

interface EmissionAllocationChangeViewProps {
  data: ChangeItem[];
}

interface ProcessedChange {
  categoryName: string;
  changes: DisplayChangeItem[];
}

interface Product {
  report_product_id: number;
  product_name: string;
  allocated_quantity: string;
}

interface ProductAllocationTotal {
  report_product_id: number;
  product_name: string;
  allocated_quantity: string;
}

interface EmissionCategoryData {
  emission_category_name: string;
  emission_total: string;
  products: Product[];
}

export const EmissionAllocationChangeView: React.FC<
  EmissionAllocationChangeViewProps
> = ({ data }) => {
  // Process and group changes by category
  const processChanges = () => {
    const categorizedChanges: Record<string, ProcessedChange> = {};

    data.forEach((change) => {
      // Handle the actual field format: root['facility_reports'][...]['report_emission_allocation']['report_product_emission_allocations'][index]
      if (change.field.includes("report_product_emission_allocations")) {
        // Extract category name from the change data
        let categoryName = "";
        let changeData: EmissionCategoryData | null = null;

        if (change.new_value && typeof change.new_value === "object") {
          changeData = change.new_value as EmissionCategoryData;
          categoryName =
            changeData.emission_category_name || "Unknown Category";
        } else if (change.old_value && typeof change.old_value === "object") {
          changeData = change.old_value as EmissionCategoryData;
          categoryName =
            changeData.emission_category_name || "Unknown Category";
        }

        if (!categoryName) return;

        if (!categorizedChanges[categoryName]) {
          categorizedChanges[categoryName] = {
            categoryName,
            changes: [],
          };
        }

        if (
          change.new_value &&
          typeof change.new_value === "object" &&
          change.old_value &&
          typeof change.old_value === "object"
        ) {
          // Handle category object changes (modified allocations)
          const newData = change.new_value as EmissionCategoryData;
          const oldData = change.old_value as EmissionCategoryData;

          // Add total emissions change if there's a difference
          if (oldData.emission_total !== newData.emission_total) {
            categorizedChanges[categoryName].changes.push({
              ...change,
              displayLabel: "Total Emissions",
              field: `${change.field}['emission_total']`,
              old_value: oldData.emission_total,
              new_value: newData.emission_total,
            } as DisplayChangeItem);
          }

          // Create maps for both old and new products
          const oldProducts = new Map(
            (oldData.products || []).map((p: Product) => [p.product_name, p]),
          );
          const newProducts = new Map(
            (newData.products || []).map((p: Product) => [p.product_name, p]),
          );

          // Process all products from new data
          (newData.products || []).forEach((product: Product) => {
            const oldProduct = oldProducts.get(product.product_name);
            const isNewProduct = !oldProduct;
            const oldQuantity = oldProduct?.allocated_quantity || "0";
            const newQuantity = product.allocated_quantity || "0";

            // Only show if there's a change or non-zero value
            if (
              Number(newQuantity) !== 0 ||
              Number(oldQuantity) !== 0 ||
              oldQuantity !== newQuantity
            ) {
              categorizedChanges[categoryName].changes.push({
                ...change,
                displayLabel: product.product_name,
                field: `${change.field}['products'][${product.product_name}]['allocated_quantity']`,
                old_value: oldQuantity,
                new_value: newQuantity,
                change_type: isNewProduct
                  ? "added"
                  : oldQuantity !== newQuantity
                  ? "modified"
                  : change.change_type,
                isNewAddition: isNewProduct,
              } as DisplayChangeItem);
            }
          });

          // Add removed products (products that were in old but not in new)
          (oldData.products || []).forEach((product: Product) => {
            if (
              !newProducts.has(product.product_name) &&
              Number(product.allocated_quantity) !== 0
            ) {
              categorizedChanges[categoryName].changes.push({
                ...change,
                displayLabel: product.product_name,
                field: `${change.field}['products'][${product.product_name}]['allocated_quantity']`,
                old_value: product.allocated_quantity,
                new_value: "0",
                change_type: "deleted",
              } as DisplayChangeItem);
            }
          });
        } else if (change.new_value && !change.old_value) {
          // Handle new category additions
          const newData = change.new_value as EmissionCategoryData;

          // Add total emissions if not zero
          if (Number(newData.emission_total || 0) !== 0) {
            categorizedChanges[categoryName].changes.push({
              ...change,
              displayLabel: "Total Emissions",
              field: `${change.field}['emission_total']`,
              old_value: "0",
              new_value: newData.emission_total,
              change_type: "added",
              isNewAddition: true,
            } as DisplayChangeItem);
          }

          // Add products
          (newData.products || []).forEach((product: Product) => {
            if (Number(product.allocated_quantity || 0) !== 0) {
              categorizedChanges[categoryName].changes.push({
                ...change,
                displayLabel: product.product_name,
                field: `${change.field}['products'][${product.product_name}]['allocated_quantity']`,
                old_value: "0",
                new_value: product.allocated_quantity,
                change_type: "added",
                isNewAddition: true,
              } as DisplayChangeItem);
            }
          });
        }
      }
      // Handle legacy format for backward compatibility
      else if (change.field.includes("emission_category:")) {
        const categoryMatch = change.field.match(/emission_category:(.*?)]/);
        if (categoryMatch) {
          const categoryName = categoryMatch[1];
          if (!categorizedChanges[categoryName]) {
            categorizedChanges[categoryName] = {
              categoryName,
              changes: [],
            };
          }

          // Handle legacy format logic...
          const productMatch = change.field.match(/product:(.*?)]/);
          let displayLabel = "";

          if (change.field.includes("emission_total")) {
            displayLabel = "Total Emissions";
          } else if (productMatch) {
            displayLabel = productMatch[1];
          }

          // Only add changes with non-zero values
          if (
            Number(change.new_value || 0) !== 0 ||
            Number(change.old_value || 0) !== 0
          ) {
            categorizedChanges[categoryName].changes.push({
              ...change,
              displayLabel,
            } as DisplayChangeItem);
          }
        }
      }
    });

    return Object.values(categorizedChanges);
  };

  // Get total changes with non-zero values and process allocation totals
  const totalChanges = data
    .filter((change) => {
      // Handle both formats of totals fields
      if (
        change.field.includes("report_product_emission_allocation_totals") ||
        change.field.includes("Report Product Emission Allocation Totals")
      ) {
        const newValue = change.new_value as ProductAllocationTotal;
        const oldValue = change.old_value as ProductAllocationTotal | null;
        return (
          Number(newValue?.allocated_quantity || 0) !== 0 ||
          Number(oldValue?.allocated_quantity || 0) !== 0
        );
      }
      return (
        (change.field.includes("facility_total_emissions") ||
          change.field.includes("emissions_attributable_for_reporting")) &&
        (Number(change.new_value || 0) !== 0 ||
          Number(change.old_value || 0) !== 0)
      );
    })
    .map((change) => {
      // Handle both formats of totals fields
      if (
        change.field.includes("report_product_emission_allocation_totals") ||
        change.field.includes("Report Product Emission Allocation Totals")
      ) {
        const newValue = change.new_value as ProductAllocationTotal;
        const oldValue = change.old_value as ProductAllocationTotal | null;

        // Determine change type and labels
        let changeType = change.change_type;
        let isNewProduct = false;

        if (!oldValue && newValue) {
          changeType = "added";
          isNewProduct = true;
        } else if (oldValue && !newValue) {
          changeType = "deleted";
        } else if (oldValue && newValue) {
          changeType = "modified";
        }

        // Extract product name from the value object
        const productName =
          newValue?.product_name || oldValue?.product_name || "Unknown Product";

        return {
          ...change,
          displayLabel: productName,
          old_value: oldValue?.allocated_quantity || "0.0000",
          new_value: newValue?.allocated_quantity || "0.0000",
          change_type: changeType,
          isNewAddition: isNewProduct,
        } as DisplayChangeItem;
      } else {
        // Handle other total changes
        let displayLabel = "";
        if (
          change.field.includes("facility_total_emissions") ||
          change.field.includes("emissions_attributable_for_reporting")
        ) {
          displayLabel = "Total emissions attributable for reporting";
        }
        return {
          ...change,
          displayLabel,
        } as DisplayChangeItem;
      }
    });

  const categorizedChanges = processChanges();

  return (
    <Box>
      {categorizedChanges.length > 0 && (
        <Box mb={4}>
          <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
            Allocation of Emissions
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {categorizedChanges
            .filter((category) => category.changes.length > 0)
            .map((category) => (
              <React.Fragment key={category.categoryName}>
                <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
                  {category.categoryName}
                </Typography>
                {category.changes.map((change, idx) => (
                  <ChangeItemDisplay
                    key={`${change.field}-${idx}`}
                    item={change}
                  />
                ))}
              </React.Fragment>
            ))}
        </Box>
      )}

      {totalChanges.length > 0 && (
        <Box mb={4}>
          <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
            Totals in tCO2e
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {totalChanges.map((change, idx) => (
            <ChangeItemDisplay key={`${change.field}-${idx}`} item={change} />
          ))}
        </Box>
      )}
    </Box>
  );
};
