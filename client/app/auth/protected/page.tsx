const session = null;

export default function Page() {
  // ❌ throw an error if no valid JWT authentication- handled by protected\error.tsx
  if (!session) throw new Error("Auth is required to access this page");

  return (
    <>
      <div className="overflow-x-auto">
        Demo Session protected page: you should not be able to reach this page
        without a valid JWT authentication token obtained through session
      </div>
    </>
  );
}
