"use client";
import { useSession } from "next-auth/react";
import getUserFullName from "@bciers/utils/src/getUserFullName";

export default function SelectOperatorHeader() {
  const { data: session } = useSession();
  const names = getUserFullName(session)?.split(" ");
  return (
    <div className="container mx-auto">
      <section className="text-center my-auto text-2xl flex flex-col gap-3 mx-auto">
        <p>
          Hi,{" "}
          <b>
            {names?.[0]} {names?.[1]}!
          </b>
        </p>
        <p>Which operator would you like to log in to?</p>
      </section>
    </div>
  );
}
