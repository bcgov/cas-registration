"use client";

import { selectOperationById } from "@/redux";
import { useSelector } from "react-redux";

export default function Page({ match }) {
  if (!match) {
    // If data is loading, update content to display a loading message
    return <div>🚀 Loading data... </div>;
  }
  const { operationId } = match.params;

  const operation = useSelector((state) =>
    state.operations.find((operation) => operation.id === operationId)
  );

  if (!operation) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    );
  }

  return (
    <section>
      <article className="operation">
        <h2>{operation.title}</h2>
        <p className="operation-content">{operation.content}</p>
      </article>
    </section>
  );
}
