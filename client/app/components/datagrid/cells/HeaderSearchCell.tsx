import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import TextField from "@mui/material/Input";

const HeaderSearchCell = ({ field }: { field: string }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

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
  };
  return (
    <div className="w-full flex items-center background-black">
      <TextField
        className="w-full px-2 py-1"
        placeholder="Search"
        onChange={handleChange}
        type="text"
        sx={{
          backgroundColor: "white",
        }}
      />
    </div>
  );
};

export default HeaderSearchCell;
