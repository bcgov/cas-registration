"use client";

import Link from "next/link";

export default function Index() {
  return (
    <div id="welcome">
      <h1>
        <span>👋 Hello there, </span>
        You are on the authenitcated dashboard
      </h1>
      <Link href="/registration/dashboard">Go To Registration</Link>
      <br />
      <Link href="/reporting">Go To Reporting</Link>
    </div>
  );
}
