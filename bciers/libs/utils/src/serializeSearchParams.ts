// 🛠️ Function to serialize search params
const serializeSearchParams = (
  params: URLSearchParams | null | undefined,
): string => {
  if (!(params instanceof URLSearchParams)) {
    return "?";
  }

  try {
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "?";
  } catch (error) {
    return "?";
  }
};

export default serializeSearchParams;
