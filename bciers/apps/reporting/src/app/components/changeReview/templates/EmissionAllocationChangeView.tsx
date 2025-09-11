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

export const EmissionAllocationChangeView: React.FC<
  EmissionAllocationChangeViewProps
> = ({ data }) => {
  // Helper to extract category name (new format only)
  const getCategoryName = (change: ChangeItem): string => {
    const newCategory = (change.newValue as EmissionCategoryData)
      ?.emission_category_name;
    const oldCategory = (change.oldValue as EmissionCategoryData)
      ?.emission_category_name;
    return newCategory || oldCategory || "Unknown Category";
  };

  // Process structured category changes
  const processCategoryChange = (change: ChangeItem): DisplayChangeItem[] => {
    const changes: DisplayChangeItem[] = [];
    const newData = change.newValue as EmissionCategoryData | undefined;
    const oldData = change.oldValue as EmissionCategoryData | undefined;

    if (!newData && !oldData) return changes;

    const oldTotal = oldData?.emission_total ?? 0;
    const newTotal = newData?.emission_total ?? 0;

    if (oldTotal !== newTotal) {
      changes.push({
        ...change,
        displayLabel: "Total Emissions",
        field: `${change.field}['emission_total']`,
        oldValue: oldTotal,
        newValue: newTotal,
        change_type:
          oldTotal === 0 ? "added" : newTotal === 0 ? "deleted" : "modified",
      });
    }

    const oldProducts = new Map(
      (oldData?.products || []).map((p) => [p.product_name, p]),
    );

    (newData?.products || []).forEach((p) => {
      const oldQuantity = Number(
        oldProducts.get(p.product_name)?.allocated_quantity ?? 0,
      );
      const newQuantity = Number(p.allocated_quantity ?? 0);

      // Skip newly added products with value 0
      if (oldQuantity === 0 && newQuantity === 0) return;

      if (oldQuantity !== newQuantity) {
        changes.push({
          ...change,
          displayLabel: p.product_name,
          field: `${change.field}['products'][${p.product_name}]['allocated_quantity']`,
          oldValue: oldQuantity,
          newValue: newQuantity,
          change_type:
            oldQuantity === 0
              ? "added"
              : newQuantity === 0
              ? "deleted"
              : "modified",
          isNewAddition: oldQuantity === 0,
        });
      }
    });

    return changes;
  };

  // Process all changes
  const processChanges = (): ProcessedChange[] => {
    const categorized: Record<string, ProcessedChange> = {};

    data.forEach((change) => {
      const categoryName = getCategoryName(change);
      if (!categorized[categoryName])
        categorized[categoryName] = { categoryName, changes: [] };

      if (change.field.includes("report_product_emission_allocations")) {
        categorized[categoryName].changes.push(
          ...processCategoryChange(change),
        );
      }
    });

    return Object.values(categorized);
  };

  // Totals helpers
  const isRelevantTotalChange = (change: ChangeItem): boolean => {
    const newValue = change.newValue as ProductAllocationTotal;
    const oldValue = change.oldValue as ProductAllocationTotal | null;
    if (
      change.field.includes("report_product_emission_allocation_totals") ||
      change.field.includes("Report Product Emission Allocation Totals")
    ) {
      return (
        Number(newValue?.allocated_quantity ?? 0) !== 0 ||
        Number(oldValue?.allocated_quantity ?? 0) !== 0
      );
    }
    return (
      (change.field.includes("facility_total_emissions") ||
        change.field.includes("emissions_attributable_for_reporting")) &&
      (Number(change.newValue ?? 0) !== 0 || Number(change.oldValue ?? 0) !== 0)
    );
  };

  const mapTotalChange = (change: ChangeItem): DisplayChangeItem => {
    const isProductTotal =
      change.field.includes("report_product_emission_allocation_totals") ||
      change.field.includes("Report Product Emission Allocation Totals");

    if (isProductTotal) {
      const newValue = change.newValue as ProductAllocationTotal | undefined;
      const oldValue = change.oldValue as ProductAllocationTotal | undefined;
      const changeType =
        !oldValue && newValue
          ? "added"
          : oldValue && !newValue
          ? "deleted"
          : "modified";
      return {
        ...change,
        displayLabel:
          newValue?.product_name ?? oldValue?.product_name ?? "Unknown Product",
        oldValue: Number(oldValue?.allocated_quantity ?? 0),
        newValue: Number(newValue?.allocated_quantity ?? 0),
        change_type: changeType,
        isNewAddition: !oldValue && !!newValue,
      };
    }

    return {
      ...change,
      displayLabel:
        change.field.includes("facility_total_emissions") ||
        change.field.includes("emissions_attributable_for_reporting")
          ? "Total emissions attributable for reporting"
          : "",
    };
  };

  const categorizedChanges = processChanges();
  const totalChanges = data.filter(isRelevantTotalChange).map(mapTotalChange);

  // Render helpers
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

  return (
    <Box>
      {categorizedChanges.length > 0 && (
        <Box mb={4}>
          <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
            Allocation of Emissions
          </Typography>
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
