export const retrieveOperations = async (): Promise<{ data: any }> => {
  const response = await fetch("http://localhost:8000/api/operations", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const result = await response.json();

  return result;
};
