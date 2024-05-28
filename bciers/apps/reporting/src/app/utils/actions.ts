"use server";


export async function getGasTypes() {
  try {
    const res = await fetch(
      "http://127.0.0.1:8000/api/reporting/get-gas-types?activity=1&source_type=1",
      {
        cache: "no-store", // Default cache option
        method: "GET",
      }
    );
    return await res.json()
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

export async function getMethodologyFields() {
  try {
    const res = await fetch(
      "http://127.0.0.1:8000/api/reporting/get-methodologies?activity=1&source_type=1&gas_type=1",
      {
        cache: "no-store", // Default cache option
        method: "GET",
      }
    );
    return await res.json();
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
};
