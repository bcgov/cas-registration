// Function to build a query string from an object of key-value pairs
// eg: buildQueryParams({ page: "1", search: "search" }) => "?page=1&search=search"

const buildQueryParams = (params: {
  [key: string]: string | number | undefined | boolean;
}) => {
  if (!params) return "";
  const query = Object.entries(params)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== "" && value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return `?${query}`;
};

export default buildQueryParams;
