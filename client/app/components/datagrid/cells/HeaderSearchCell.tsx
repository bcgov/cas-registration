"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { TextField } from "@mui/material";
import OutsideClickHandler from "react-outside-click-handler";

const HeaderSearchCell = ({
  field,
  isFocused,
  setLastFocusedField,
}: {
  field: string;
  isFocused: boolean;
  setLastFocusedField: (field: string | null) => void;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
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
    replace(`${pathname}?${params.toString()}`);
    setSearchState(searchTerm);
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
          value={searchState}
          type="text"
          id={field}
          inputRef={(input) => {
            if (isFocused) {
              input?.focus();
            }
          }}
          onFocus={(e) => {
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

export default HeaderSearchCell;
