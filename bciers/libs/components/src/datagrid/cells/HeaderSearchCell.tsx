"use client";

import { useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { TextField } from "@mui/material";
import OutsideClickHandler from "react-outside-click-handler";
import { GridColumnGroupHeaderParams } from "@mui/x-data-grid";

const SearchCell = ({
  field,
  fieldLabel,
  isFocused,
  setLastFocusedField,
}: {
  field: string;
  fieldLabel: string;
  isFocused: boolean;
  setLastFocusedField: (field: string | null) => void;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  console.log("pathname", pathname);
  // const { replace } = useRouter();
  const [searchState, setSearchState] = useState(searchParams.get(field) || "");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    const searchTerm = event.target.value;

    if (searchTerm) {
      // Set the search term in the URL
      params.set(field, searchTerm);
    } else {
      // Remove the search term from the URL
      params.delete(field);
    }

    // Set the last focused field so we can keep focus on the field
    // after the component re-renders eg when fetching new data
    setLastFocusedField(field);

    // Update the URL with the new search term
    //  replace(`${pathname}?${params.toString()}`);
    setSearchState(searchTerm);

    // Need shallow routing to prevent page reload
    // However, this doesn't include the /registration path
    window.history.replaceState({}, "", `${pathname}?${params.toString()}`);
  };

  const handleResetFocus = () => {
    setLastFocusedField(null);
  };

  return (
    <div className="w-full pt-2">
      <OutsideClickHandler onOutsideClick={handleResetFocus}>
        <TextField
          className="w-full px-2 py-1"
          placeholder="Search"
          onChange={handleChange}
          onClick={() => setLastFocusedField(field)}
          value={searchState}
          type="text"
          aria-label={`${fieldLabel} search field`}
          id={field}
          inputRef={(input) => {
            if (isFocused) {
              input?.focus();
            }
          }}
          onFocus={(e) => {
            if (!isFocused) {
              setLastFocusedField(field);
            }
            // Move the cursor to the end of the input field when focused
            e.currentTarget.setSelectionRange(
              e.currentTarget.value.length,
              e.currentTarget.value.length,
            );
          }}
          sx={{
            input: {
              padding: "8px",
            },
          }}
        />
      </OutsideClickHandler>
    </div>
  );
};

const HeaderSearchCell = ({
  lastFocusedField,
  setLastFocusedField,
}: {
  lastFocusedField: string | null;
  setLastFocusedField: (value: string | null) => void;
}) => {
  const RenderCell = (params: GridColumnGroupHeaderParams) => {
    const { groupId, headerName } = params;
    return (
      <SearchCell
        field={groupId ?? ""}
        fieldLabel={headerName ?? ""}
        isFocused={lastFocusedField === groupId}
        setLastFocusedField={setLastFocusedField}
      />
    );
  };
  return RenderCell;
};

export default HeaderSearchCell;
