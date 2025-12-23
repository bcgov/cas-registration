import { useState } from "react";

const useKey: () => [number, () => void] = () => {
  /**
   * Utility to manage a state meant to be used as a unique key to drive re-rendering of a component.
   * Guaranteed to generate a different 'key' every time 'resetKey()' is called, by incrementing the previous value.
   *
   * Note: This is meant to be temporary until the implications of removing the FormBase `isSubmitting` guard
   * on its formData are understood.
   */
  const [key, setKey] = useState(1);
  const resetKey = () => setKey((prevKey) => prevKey + 1);
  return [key, resetKey];
};

export default useKey;
