const extractParams = (mockCall: string, paramToExtract: string) => {
  const decodedQueryParams = decodeURIComponent(mockCall);
  const params = new URLSearchParams(decodedQueryParams);
  return params.get(paramToExtract);
};

export default extractParams;
