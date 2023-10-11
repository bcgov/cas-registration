"use client";

import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>Links to app pages...</h1>
      <ul>
        <Link className="text-red-500" href="/operations">
          Operations
        </Link>
      </ul>
    </>
  );
}
