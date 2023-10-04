"use client";
// 📌 error pages must be client page

// ✨ The creation of this file automatically creates default error boundary to catch errors not handled within their path boundry
export default function Error() {
  return (
    <>
      <div className="grid h-screen px-4 bg-white place-content-center">
        <div className="text-center">
          <h1 className="font-black text-gray-200 text-9xl">
            DEFAULT ERROR PAGE
          </h1>
        </div>
      </div>
    </>
  );
}
