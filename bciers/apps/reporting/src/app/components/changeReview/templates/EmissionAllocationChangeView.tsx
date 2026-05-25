import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import {
  ChangeItem,
  DisplayChangeItem,
  EmissionAllocationChangeViewProps,
  EmissionCategoryData,
  ProcessedChange,
  ProductAllocationTotal,
} from "../constants/types";

// Render section for totals
const TotalsSection = ({ changes }: { changes: DisplayChangeItem[] }) => (
  <>
    <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
      Totals in tCO2e
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {changes.map((change, idx) => (
      <ChangeItemDisplay key={`${change.field}-${idx}`} item={change} />
    ))}
  </>
);

export const EmissionAllocationChangeView: React.FC<
  EmissionAllocationChangeViewProps
> = ({ data }) => {
  // Process and group changes by category
  // Helper to process category changes
  function processCategoryChange(change: ChangeItem): DisplayChangeItem[] {
    const changes: DisplayChangeItem[] = [];
    const newData = change.newValue as EmissionCategoryData | undefined;
    const oldData = change.oldValue as EmissionCategoryData | undefined;
    const categoryName =
      newData?.emission_category_name ||
      oldData?.emission_category_name ||
      "Unknown Category";

    if (!categoryName) return changes;

    if (newData && oldData) {
      if (oldData.emission_total !== newData.emission_total) {
        changes.push({
          ...change,
          displayLabel: "Total Emissions",
          field: `${change.field}['emission_total']`,
          oldValue: oldData.emission_total,
          newValue: newData.emission_total,
        });
      }
      const oldProducts = new Map(
        (oldData.products || []).map((p) => [p.product_name, p]),
      );
      const newProducts = new Map(
        (newData.products || []).map((p) => [p.product_name, p]),
      );
      (newData.products || []).forEach((product) => {
        const oldProduct = oldProducts.get(product.product_name);
        const isNewProduct = !oldProduct;
        const oldQuantity = oldProduct?.allocated_quantity || "0";
        const newQuantity = product.allocated_quantity || "0";
        if (
          Number(newQuantity) !== 0 ||
          Number(oldQuantity) !== 0 ||
          oldQuantity !== newQuantity
        ) {
          changes.push({
            ...change,
            displayLabel: product.product_name,
            field: `${change.field}['products'][${product.product_name}]['allocated_quantity']`,
            oldValue: oldQuantity,
            newValue: newQuantity,
            change_type: isNewProduct
              ? "added"
              : oldQuantity !== newQuantity
                ? "modified"
                : change.change_type,
            isNewAddition: isNewProduct,
          });
        }
      });
      (oldData.products || []).forEach((product) => {
        if (
          !newProducts.has(product.product_name) &&
          Number(product.allocated_quantity) !== 0
        ) {
          changes.push({
            ...change,
            displayLabel: product.product_name,
            field: `${change.field}['products'][${product.product_name}]['allocated_quantity']`,
            oldValue: product.allocated_quantity,
            newValue: "0",
            change_type: "removed",
          });
        }
      });
    } else if (newData && !oldData) {
      if (Number(newData.emission_total || 0) !== 0) {
        changes.push({
          ...change,
          displayLabel: "Total Emissions",
          field: `${change.field}['emission_total']`,
          oldValue: "0",
          newValue: newData.emission_total,
          change_type: "added",
          isNewAddition: true,
        });
      }
      (newData.products || []).forEach((product) => {
        if (Number(product.allocated_quantity || 0) !== 0) {
          changes.push({
            ...change,
            displayLabel: product.product_name,
            field: `${change.field}['products'][${product.product_name}]['allocated_quantity']`,
            oldValue: "0",
            newValue: product.allocated_quantity,
            change_type: "added",
            isNewAddition: true,
          });
        }
      });
    }
    return changes;
  }

  type ChangeMeta = {
    categoryName: string;
    displayLabel: string;
  };

  // Helper to extract category name and display label from flat field path format
  const parseChangeMeta = (change: ChangeItem): ChangeMeta | null => {
    const categoryMatch = change.field.match(
      /\['report_product_emission_allocations']\['([^']+)']/,
    );

    if (!categoryMatch) return null;

    // Determine display label and add change if valid
    const categoryName = categoryMatch[1];

    if (change.field.includes("emission_total")) {
      return {
        categoryName,
        displayLabel: "Total Emissions",
      };
    }

    if (change.field.includes("['products']['")) {
      const productMatch = change.field.match(/\['products']\['([^']+)']/);
      return {
        categoryName,
        displayLabel: productMatch?.[1] || "",
      };
    }

    return null;
  };

  // Helper to handle legacy format for backward compatibility
  const parseLegacyChangeMeta = (change: ChangeItem): ChangeMeta | null => {
    const categoryMatch = change.field.match(/emission_category:(.*?)]/);

    if (!categoryMatch) return null;

    const categoryName = categoryMatch[1];

    // Handle legacy format logic
    const productMatch = change.field.match(/product:(.*?)]/);
    let displayLabel = "";

    if (change.field.includes("emission_total")) {
      displayLabel = "Total Emissions";
    } else if (productMatch) {
      displayLabel = productMatch[1];
    }

    // Only add changes with non-zero values
    if (
      Number(change.newValue || 0) !== 0 ||
      Number(change.oldValue || 0) !== 0
    ) {
      return {
        categoryName,
        displayLabel,
      };
    }

    return null;
  };

  const upsertChange = (
    categorizedChanges: Record<string, ProcessedChange>,
    change: ChangeItem | DisplayChangeItem,
    categoryName: string,
    fallbackLabel: string = "",
  ) => {
    categorizedChanges[categoryName] ??= { categoryName, changes: [] };

    categorizedChanges[categoryName].changes.push({
      displayLabel: fallbackLabel,
      ...change,
    } as DisplayChangeItem);
  };

  const processChanges = () => {
    const categorizedChanges: Record<string, ProcessedChange> = {};
    data.forEach((change) => {
      if (change.field.includes("report_product_emission_allocations")) {
        const changeMeta = parseChangeMeta(change);

        if (changeMeta) {
          upsertChange(
            categorizedChanges,
            change,
            changeMeta.categoryName,
            changeMeta.displayLabel,
          );
        } else {
          // Fallback to original nested object processing
          const changes = processCategoryChange(change);
          const categoryName =
            (change.newValue as EmissionCategoryData)?.emission_category_name ||
            (change.oldValue as EmissionCategoryData)?.emission_category_name ||
            "Unknown Category";

          for (const change of changes) {
            upsertChange(categorizedChanges, change, categoryName);
          }
        }
      } else if (change.field.includes("emission_category:")) {
        // Handle legacy format for backward compatibility
        const legacyChangeMeta = parseLegacyChangeMeta(change);
        if (legacyChangeMeta) {
          upsertChange(
            categorizedChanges,
            change,
            legacyChangeMeta.categoryName,
            legacyChangeMeta.displayLabel,
          );
        }
      }
    });

    return Object.values(categorizedChanges);
  };

  // Helper to check if a change is a relevant total change
  function isRelevantTotalChange(change: ChangeItem): boolean {
    if (
      change.field.includes("report_product_emission_allocation_totals") ||
      change.field.includes("Report Product Emission Allocation Totals")
    ) {
      const newValue = change.newValue as ProductAllocationTotal;
      const oldValue = change.oldValue as ProductAllocationTotal | null;
      return (
        Number(newValue?.allocated_quantity || 0) !== 0 ||
        Number(oldValue?.allocated_quantity || 0) !== 0
      );
    }
    return (
      (change.field.includes("facility_total_emissions") ||
        change.field.includes("emissions_attributable_for_reporting")) &&
      (Number(change.newValue || 0) !== 0 || Number(change.oldValue || 0) !== 0)
    );
  }

  // Helper to map total changes (refactored for brevity)
  function mapTotalChange(change: ChangeItem): DisplayChangeItem[] {
    const isProductTotal =
      change.field.includes("report_product_emission_allocation_totals") ||
      change.field.includes("Report Product Emission Allocation Totals");

    if (!isProductTotal) {
      return [
        {
          ...change,
          displayLabel:
            change.field.includes("facility_total_emissions") ||
            change.field.includes("emissions_attributable_for_reporting")
              ? "Total emissions attributable for reporting"
              : "",
        },
      ];
    }

    const newValue = change.newValue as ProductAllocationTotal | undefined;
    const oldValue = change.oldValue as ProductAllocationTotal | undefined;

    const result: DisplayChangeItem[] = [];

    // Old product deleted
    if (
      oldValue &&
      (!newValue || oldValue.product_name !== newValue.product_name)
    ) {
      result.push({
        ...change,
        displayLabel: oldValue.product_name,
        oldValue: oldValue.allocated_quantity ?? "0.0000",
        newValue: "0",
        change_type: "removed",
        isNewAddition: false,
      });
    }

    // New product added
    if (
      newValue &&
      (!oldValue || oldValue.product_name !== newValue.product_name)
    ) {
      result.push({
        ...change,
        displayLabel: newValue.product_name,
        oldValue: "0",
        newValue: newValue.allocated_quantity ?? "0.0000",
        change_type: "added",
        isNewAddition: true,
      });
    }

    // If same product, check if modified
    if (
      oldValue &&
      newValue &&
      oldValue.product_name === newValue.product_name &&
      oldValue.allocated_quantity !== newValue.allocated_quantity
    ) {
      result.push({
        ...change,
        displayLabel: newValue.product_name,
        oldValue: oldValue.allocated_quantity ?? "0.0000",
        newValue: newValue.allocated_quantity ?? "0.0000",
        change_type: "modified",
        isNewAddition: false,
      });
    }

    return result;
  }

  // Helper to determine if change is a false positive due to supplementary report report_product_id
  function isFalsePositive(change: DisplayChangeItem): boolean {
    // Check for equal value
    if (change.oldValue !== change.newValue) return false;

    // Check for equal amount of products
    const oldProducts = (change as any).old_value?.products || [];
    const newProducts = (change as any).new_value?.products || [];
    if (oldProducts.length !== newProducts.length) return false;

    // Check for matching product names and quantities
    for (let i = 0; i < newProducts.length; i++) {
      if (
        newProducts[i]?.product_name !== oldProducts[i]?.product_name ||
        newProducts[i]?.allocated_quantity !==
          oldProducts[i]?.allocated_quantity
      )
        return false;
    }

    // If all checks passed, it's a false positive
    return true;
  }

  const generalFields = data
    .filter(
      (change) =>
        change.field.includes("allocation_methodology") ||
        change.field.includes("allocation_other_methodology_description"),
    )
    .map((change) => {
      const displayLabel = change.field.includes("allocation_methodology")
        ? "Methodology"
        : "Details about the allocation methodology";
      let changeType = change.change_type;
      if (!change.oldValue) changeType = "added";
      else if (!change.newValue) changeType = "removed";
      return { ...change, displayLabel, changeType } as DisplayChangeItem;
    });
  const totalChanges = data
    .filter(isRelevantTotalChange)
    .flatMap(mapTotalChange);

  const categorizedChanges = processChanges()
    .map((categorizedChange) => ({
      ...categorizedChange,
      changes: categorizedChange?.changes.filter(
        (change) => !isFalsePositive(change),
      ),
    }))
    .filter((categorizedChange) => categorizedChange.changes.length > 0);

  // Render section for a category
  const CategorySection = ({ category }: { category: ProcessedChange }) => (
    <>
      <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
        {category.categoryName}
      </Typography>
      {category.changes.map((change, idx) => (
        <ChangeItemDisplay key={`${change.field}-${idx}`} item={change} />
      ))}
    </>
  );

  return (
    <Box>
      {categorizedChanges.length > 0 && (
        <Box mb={4}>
          <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
            Allocation of Emissions
          </Typography>
          {generalFields.map((change) => (
            <ChangeItemDisplay key={change.field} item={change} />
          ))}
          <Divider sx={{ mb: 2 }} />
          {categorizedChanges
            .filter((c) => c.changes.length > 0)
            .map((category) => (
              <CategorySection
                key={category.categoryName}
                category={category}
              />
            ))}
        </Box>
      )}
      {totalChanges.length > 0 && (
        <Box mb={4}>
          <TotalsSection changes={totalChanges} />
        </Box>
      )}
    </Box>
  );
};
