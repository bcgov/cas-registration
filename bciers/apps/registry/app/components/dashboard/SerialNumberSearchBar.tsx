import SearchIcon from "@mui/icons-material/Search";

export default function SerialNumberSearchBar() {
  return (
    <div className="w-full lg:w-1/2">
      <label className="sr-only" htmlFor="registry-serial-number-search">
        Look up a serial number across all registry activity
      </label>
      <div className="flex h-[84px] items-center gap-3 rounded-2xl border border-gray-400 px-5 text-gray-500 focus-within:border-gray-500 focus-within:ring-2 focus-within:ring-gray-200">
        <SearchIcon aria-hidden="true" className="shrink-0" fontSize="medium" />
        <input
          className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 outline-none placeholder:text-sm placeholder:text-gray-500 focus:ring-0 sm:text-[30px]"
          id="registry-serial-number-search"
          placeholder="Look up a serial number across all registry activity"
          type="search"
        />
      </div>
    </div>
  );
}
