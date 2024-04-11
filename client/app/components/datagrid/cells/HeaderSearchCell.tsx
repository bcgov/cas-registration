"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { TextField } from "@mui/material";

const HeaderSearchCell = ({ field }: { field: string }) => {
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
      <TextField
        className="w-full px-2 py-1"
        placeholder="Search"
        onChange={handleChange}
        value={searchState}
        type="text"
        sx={{
          input: {
            padding: "8px",
          },
        }}
      />
    </div>
  );
};

export default HeaderSearchCell;
