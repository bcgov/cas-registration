import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonForm";
import Operators from "./Operators";

export default async function OperatorsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <div>
        <h1>Facilities and operators page</h1>
        <h2>Operators:</h2>
        <Operators />
      </div>
    </Suspense>
  );
}
