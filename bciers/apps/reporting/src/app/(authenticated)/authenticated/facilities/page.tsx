"use client"

import React from 'react';
import { actionHandler } from "@/app/utils/actions";

const Page: React.FC = () => {
  const fetchOperators = async () => {
    try {
      const operatorList = await actionHandler(
        "registration/operations",
        "GET",
      );
      return operatorList.data;
    } catch (error) {
      // Handle the error here or rethrow it to handle it at a higher level
      throw error;
    }
  };

  return (
    <div>
      <h1>Facilities and operators page</h1>
      <h2>Operators:</h2>
      <OperatorsDisplay fetchOperators={fetchOperators} />
    </div>
  );
};

const OperatorsDisplay: React.FC<{ fetchOperators: () => Promise<any> }> = ({ fetchOperators }) => {
  const [operators, setOperators] = React.useState<any>(null);

  React.useEffect(() => {
    fetchOperators().then((operatorsData) => {
      setOperators(operatorsData);
    });
  }, [fetchOperators]);

  if (!operators) {
    return <p>Loading...</p>;
  }

  return <p>{JSON.stringify(operators, null, 2)}</p>;
};

export default Page;
