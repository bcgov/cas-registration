"use client";

import { useGetOperationQuery } from "@/redux";

export default function Page({ params }: { params: { operation: number } }) {
  console.log("params.operation", params.operation);
  const { data, isLoading, error } = useGetOperationQuery(params.operation);

  if (!data) {
    return (
      <section>
        <h2>Operation not found!</h2>
      </section>
    );
  }

  return (
    <section>
      <article className="operation">
        made it past if
        <h2>{data.name}</h2>
        operation: {JSON.stringify(data)}
      </article>
    </section>
  );
}
