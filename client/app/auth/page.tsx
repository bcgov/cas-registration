import Link from "next/link";
export default function Page() {
  return (
    <>
      <div className="grid h-screen px-4 bg-white place-content-center">
        <div className="text-center">
          <h1 className="font-black text-gray-200 text-9xl">AUTH HOME PAGE</h1>

          <Link href="/auth/general">
            <button
              type="button"
              className="inline-block px-5 py-3 mt-6 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring"
            >
              Auth General Page
            </button>
          </Link>
          <Link href="/auth/protected">
            <button
              type="button"
              className="inline-block px-5 py-3 mt-6 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring"
            >
              Auth Protected Page
            </button>
          </Link>
          <Link href="/signout">
            <button
              type="button"
              className="inline-block px-5 py-3 mt-6 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring"
            >
              Sign-Out
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
