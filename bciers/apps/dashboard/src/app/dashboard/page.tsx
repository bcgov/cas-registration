"use client";

import Link from "next/link";

export default function Page() {
  return (
    <>
      <Link href="/registration/dashboard">Go To Registration</Link>
      <br />
      <Link href="/reporting">Go To Reporting</Link>
    </>
  );
}
