"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { TextField } from "@mui/material";
import OutsideClickHandler from "react-outside-click-handler";

const HeaderSearchCell = ({
  field,
  isFocused,
  onBlur,
  onFocus,
}: {
  field: string;
  isFocused: boolean;
  onBlur: () => void;
  onFocus: (field: string) => void;
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

    // Update the URL with the new search term
    replace(`${pathname}?${params.toString()}`);
    setSearchState(searchTerm);
  };

  return (
    <div className="w-full">
      <OutsideClickHandler onOutsideClick={() => onBlur()}>
        <TextField
          className="w-full px-2 py-1"
          placeholder="Search"
          onBlur={onBlur}
          onChange={handleChange}
          value={searchState}
          type="text"
          inputRef={(input) => {
            if (isFocused) {
              input?.focus();
            }
          }}
          onFocus={(e) => {
            // Save the last focused field so we can restore focus when the DataGrid is re-rendered
            // (e.g. when the user searches or sorts the grid)
            onFocus(field);
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
