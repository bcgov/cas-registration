import Link from "next/link";

export default function Page() {
  return (
    <>
      <div className="grid h-screen px-4 bg-white place-content-center">
        <div className="text-center">
          <h1 className="font-black text-gray-200 text-9xl">
            AUTH GENERAL PAGE
          </h1>
        </div>
        <Link href="/auth">
          <button
            type="button"
            className="inline-block px-5 py-3 mt-6 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring"
          >
            Auth Home Page
          </button>
        </Link>
      </div>
    </>
  );
}
