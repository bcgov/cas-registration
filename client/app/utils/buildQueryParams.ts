// Function to build a query string from an object of key-value pairs
// eg:
// buildQueryParams({ page: "1", search: "search" }) => "&page=1&search=search"

const buildQueryParams = (params: {
  [key: string]: string | number | undefined;
}) => {
  const query = Object.entries(params)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== "")
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return `?${query}`;
};

export default buildQueryParams;
