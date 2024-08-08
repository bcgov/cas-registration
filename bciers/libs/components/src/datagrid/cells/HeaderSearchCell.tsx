"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TextField } from "@mui/material";
import OutsideClickHandler from "react-outside-click-handler";
import { GridColumnGroupHeaderParams } from "@mui/x-data-grid";
import debounce from "lodash.debounce";

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
  const [searchState, setSearchState] = useState(searchParams.get(field) || "");

  useEffect(() => {
    const debounced = debounce(() => {
      const params = new URLSearchParams(searchParams);

      if (searchState) {
        // Set the search term in the URL
        params.set(field, searchState);
      } else {
        // Remove the search term from the URL
        params.delete(field);
      }

      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`,
      );
    }, 400);

    debounced();

    return () => {
      debounced.cancel();
    };
  }, [searchState]);

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
    setSearchState(searchTerm);

    // Need shallow routing to prevent page reload
    // window.history.replaceState({}, "", `${pathname}?${params.toString()}`);
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
