"use client";
import SelectOperatorForm from "apps/administration/app/components/userOperators/SelectOperatorForm";
import { useSession } from "next-auth/react";
import getUserFullName from "@bciers/utils/getUserFullName";
export default function Page() {
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
      <SelectOperatorForm />
    </div>
  );
}
