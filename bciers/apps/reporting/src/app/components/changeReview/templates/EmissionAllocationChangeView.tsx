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
  console.log("EmissionAllocationChangeView data:", data);

  // Helper to extract category name
  const getCategoryName = (change: ChangeItem): string => {
    const newCategory = (change.newValue as EmissionCategoryData)
      ?.emission_category_name;
    const oldCategory = (change.oldValue as EmissionCategoryData)
      ?.emission_category_name;
    if (newCategory) return newCategory;
    if (oldCategory) return oldCategory;

    const newFormatMatch = change.field.match(
      /report_product_emission_allocations'\]\['([^'\]]+)'/,
    );
    if (newFormatMatch) return newFormatMatch[1];

    const legacyMatch = change.field.match(/emission_category:([^'\]]+)/);
    if (legacyMatch) return legacyMatch[1];

    return "Unknown Category";
  };

  // Helper to extract display label from field
  const getDisplayLabel = (change: ChangeItem, productName?: string) => {
    if (change.field.includes("emission_total")) return "Total Emissions";
    if (productName) return productName;
    const match = change.field.match(/products'\]\['([^'\]]+)'/);
    return match ? match[1] : "";
  };

  // Process structured category changes
  const processCategoryChange = (change: ChangeItem): DisplayChangeItem[] => {
    const changes: DisplayChangeItem[] = [];
    const newData = change.newValue as EmissionCategoryData | undefined;
    const oldData = change.oldValue as EmissionCategoryData | undefined;

    if (!newData && !oldData) return changes;

    const oldTotal = oldData?.emission_total ?? "0";
    const newTotal = newData?.emission_total ?? "0";
    if (oldTotal !== newTotal) {
      changes.push({
        ...change,
        displayLabel: "Total Emissions",
        field: `${change.field}['emission_total']`,
        oldValue: oldTotal,
        newValue: newTotal,
        change_type:
          oldTotal === "0"
            ? "added"
            : newTotal === "0"
            ? "deleted"
            : "modified",
      });
    }

    const oldProducts = new Map(
      (oldData?.products || []).map((p) => [p.product_name, p]),
    );
    const newProducts = new Map(
      (newData?.products || []).map((p) => [p.product_name, p]),
    );

    (newData?.products || []).forEach((p) => {
      const oldQuantity =
        oldProducts.get(p.product_name)?.allocated_quantity ?? "0";
      const newQuantity = p.allocated_quantity ?? "0";

      // Skip newly added products with value 0
      if (oldQuantity === "0" && Number(newQuantity) === 0) return;

      if (oldQuantity !== newQuantity) {
        changes.push({
          ...change,
          displayLabel: p.product_name,
          field: `${change.field}['products'][${p.product_name}]['allocated_quantity']`,
          oldValue: oldQuantity,
          newValue: newQuantity,
          change_type:
            oldQuantity === "0"
              ? "added"
              : newQuantity === "0"
              ? "deleted"
              : "modified",
          isNewAddition: oldQuantity === "0",
        });
      }
    });

    (oldData?.products || []).forEach((p) => {
      if (
        !newProducts.has(p.product_name) &&
        Number(p.allocated_quantity) !== 0
      ) {
        changes.push({
          ...change,
          displayLabel: p.product_name,
          field: `${change.field}['products'][${p.product_name}]['allocated_quantity']`,
          oldValue: p.allocated_quantity,
          newValue: "0",
          change_type: "deleted",
        });
      }
    });

    return changes;
  };

  // Process field-based individual changes (legacy or new format)
  const processFieldBasedChange = (change: ChangeItem): DisplayChangeItem => {
    const productName = getDisplayLabel(change);
    return {
      ...change,
      displayLabel: productName,
      oldValue:
        typeof change.oldValue === "object"
          ? change.oldValue.allocated_quantity
          : change.oldValue,
      newValue:
        typeof change.newValue === "object"
          ? change.newValue.allocated_quantity
          : change.newValue,
      change_type: change.change_type,
      isNewAddition: false,
    };
  };

  // Process all changes
  const processChanges = (): ProcessedChange[] => {
    const categorized: Record<string, ProcessedChange> = {};

    data.forEach((change) => {
      const categoryName = getCategoryName(change);
      if (!categorized[categoryName])
        categorized[categoryName] = { categoryName, changes: [] };

      if (change.field.includes("report_product_emission_allocations")) {
        const hasCategoryData =
          (change.newValue as EmissionCategoryData)?.emission_category_name ||
          (change.oldValue as EmissionCategoryData)?.emission_category_name;
        if (hasCategoryData) {
          categorized[categoryName].changes.push(
            ...processCategoryChange(change),
          );
        } else {
          categorized[categoryName].changes.push(
            processFieldBasedChange(change),
          );
        }
      } else if (change.field.includes("emission_category:")) {
        const displayLabel = getDisplayLabel(change);
        if (
          Number(change.newValue || 0) !== 0 ||
          Number(change.oldValue || 0) !== 0
        ) {
          categorized[categoryName].changes.push({
            ...change,
            displayLabel,
          } as DisplayChangeItem);
        }
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
        Number(newValue?.allocated_quantity || 0) !== 0 ||
        Number(oldValue?.allocated_quantity || 0) !== 0
      );
    }
    return (
      (change.field.includes("facility_total_emissions") ||
        change.field.includes("emissions_attributable_for_reporting")) &&
      (Number(change.newValue || 0) !== 0 || Number(change.oldValue || 0) !== 0)
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
        oldValue: oldValue?.allocated_quantity ?? "0.0000",
        newValue: newValue?.allocated_quantity ?? "0.0000",
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

  // General methodology fields
  const generalFields = data
    .filter(
      (change) =>
        change.field.includes("allocation_methodology") ||
        change.field.includes("allocation_other_methodology_description"),
    )
    .map((change) => ({
      ...change,
      displayLabel: change.field.includes("allocation_methodology")
        ? "Methodology"
        : "Details about the allocation methodology",
      change_type: !change.oldValue
        ? "added"
        : !change.newValue
        ? "deleted"
        : change.change_type,
    })) as DisplayChangeItem[];

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
