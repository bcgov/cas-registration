<<<<<<< HEAD
export default async function Page() {
  return (
    <>
      <h1>To do</h1>
=======
import Link from "next/link";

export default function Page() {
  return (
    <>
      <div className="grid h-screen px-4 bg-white place-content-center">
        <div className="text-center">
          <h1 className="font-black text-gray-200 text-9xl">AUTH SIGN IN</h1>

          <p className="mt-4 text-gray-500">
            You must be logged in to access the site
          </p>

          <Link href="/authenticate">
            <button
              type="button"
              className="inline-block px-5 py-3 mt-6 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring"
            >
              Sign-In!
            </button>
          </Link>
        </div>
      </div>
>>>>>>> cbda85b0ce1cbe80a61136928895707c18560be6
    </>
  );
}
