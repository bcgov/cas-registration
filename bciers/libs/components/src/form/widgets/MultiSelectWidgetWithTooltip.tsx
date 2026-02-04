"use client";

import { useEffect, useState } from "react";
import {
  Autocomplete,
  AutocompleteRenderGetTagProps,
  Chip,
  MenuItem,
  TextField,
  Tooltip,
  Zoom,
} from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";
import { Option, FieldSchema } from "./MultiSelectWidget";

interface OptionWithTooltip extends Option {
  tooltip?: string;
}

export interface FieldSchemaWithTooltip extends FieldSchema {
  enumTooltips?: Array<string>;
}

export const mapOptionsWithTooltips = (
  fieldSchema: FieldSchemaWithTooltip,
): OptionWithTooltip[] => {
  const enumValues = fieldSchema?.enum;
  if (enumValues) {
    const enumNames = fieldSchema?.enumNames;
    const enumTooltips = fieldSchema?.enumTooltips;
    return enumValues.map((enumValue: string | number, index: number) => ({
      id: enumValue,
      label: enumNames?.[index] ?? enumValue,
      tooltip: enumTooltips?.[index],
    }));
  } else {
    return [];
  }
};

const MultiSelectWidgetWithTooltip: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  rawErrors,
  readonly,
  schema,
  value,
  uiSchema,
}) => {
  const isValue = value && value.length !== 0 && value?.[0] !== undefined;
  const fieldSchema = schema.items as FieldSchemaWithTooltip;

  const options = mapOptionsWithTooltips(fieldSchema);

  // // Track the currently highlighted option for keyboard accessibility
  const [highlightedOption, setHighlightedOption] =
    useState<OptionWithTooltip | null>(null);

  const handleChange = (
    e: React.SyntheticEvent,
    selectedOptions: Array<string | OptionWithTooltip>,
  ) => {
    // Filter out any string values (free-form input) and only keep OptionWithTooltip objects
    const validOptions = selectedOptions.filter(
      (option): option is OptionWithTooltip => typeof option !== "string",
    );
    onChange(validOptions.map((option: OptionWithTooltip) => option.id));
  };

  useEffect(() => {
    if (!isValue) {
      onChange([]);
    }
  }, []);

  const placeholder = uiSchema?.["ui:placeholder"]
    ? `${uiSchema["ui:placeholder"]}...`
    : "";

  // Optional prefix for tooltips (e.g.: "Regulatory name: ")
  const tooltipPrefix = uiSchema?.["ui:tooltipPrefix"] as string | undefined;

  // Helper to render tooltip with optional prefix
  const renderTooltipContent = (tooltipText: string) => {
    if (tooltipPrefix) {
      return (
        <span>
          <strong>{tooltipPrefix}</strong>
          {tooltipText}
        </span>
      );
    }
    return tooltipText;
  };

  const displayPlaceholder = !isValue;

  const isError = rawErrors && rawErrors.length > 0;
  const borderColor = isError ? BC_GOV_SEMANTICS_RED : DARK_GREY_BG_COLOR;

  const styles = {
    width: "100%",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: borderColor,
    },
  };

  const chipStyle = {
    height: "auto",
    maxWidth: "150px",
    "& .MuiChip-label": {
      whiteSpace: "normal", // Allows text wrapping
      wordBreak: "break-word", // Breaks long words if needed
      overflowWrap: "break-word", // Ensures proper word breaks
      display: "block", // Forces multiline wrapping
      padding: ".5rem", // Spaces to match the design document
    },
  };

  const menuItemStyle = {
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  };

  return (
    <Autocomplete
      id={id}
      disabled={disabled || readonly}
      disablePortal
      multiple
      freeSolo
      filterSelectedOptions
      options={options}
      value={
        isValue
          ? value.map((val: string | number) => {
              return options.find(
                (option: OptionWithTooltip) => option.id === val,
              );
            })
          : []
      }
      sx={styles}
      isOptionEqualToValue={(
        option: OptionWithTooltip,
        val: OptionWithTooltip,
      ) => {
        return option.id === val.id;
      }}
      onChange={handleChange}
      onHighlightChange={(event, option) => {
        setHighlightedOption(option as OptionWithTooltip | null);
      }}
      getOptionLabel={(option: string | OptionWithTooltip) => {
        if (typeof option === "string") {
          return option;
        }
        return String(option.label);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={displayPlaceholder ? placeholder : ""}
        />
      )}
      renderTags={(
        renderOptions: Array<OptionWithTooltip>,
        getTagProps: AutocompleteRenderGetTagProps,
      ) => {
        return renderOptions.map((option: OptionWithTooltip, index: number) => {
          const { key, ...tagProps } = getTagProps({ index });
          const chip = (
            <Chip key={key} label={option.label} {...tagProps} sx={chipStyle} />
          );
          if (option.tooltip) {
            return (
              <Tooltip
                key={option.id}
                title={renderTooltipContent(option.tooltip)}
                placement="top"
                arrow
                slots={{
                  transition: Zoom,
                }}
                PopperProps={{
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -10],
                      },
                    },
                  ],
                }}
              >
                {chip}
              </Tooltip>
            );
          }
          return chip;
        });
      }}
      renderOption={(renderProps, option: OptionWithTooltip) => {
        const isHighlighted = highlightedOption?.id === option.id;
        const menuItem = (
          <MenuItem
            {...renderProps}
            key={option.id}
            value={option.id}
            sx={menuItemStyle}
          >
            {option.label}
          </MenuItem>
        );
        if (option.tooltip) {
          return (
            <Tooltip
              key={option.id}
              title={renderTooltipContent(option.tooltip)}
              placement="right"
              open={isHighlighted}
              arrow
              slots={{
                transition: Zoom,
              }}
              PopperProps={{
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, -7],
                    },
                  },
                ],
              }}
            >
              {menuItem}
            </Tooltip>
          );
        }
        return menuItem;
      }}
    />
  );
};

export default MultiSelectWidgetWithTooltip;
