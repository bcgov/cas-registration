"use client"

import React, { useState, useEffect } from 'react';
import { actionHandler } from "@/app/utils/actions";

const Page: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await actionHandler(
          "registration/operations",
          "GET",
        );
        setMessage(JSON.stringify(response.data, null, 2));
  
        return;
      } catch (error) {
        // Handle the error here or rethrow it to handle it at a higher level
        throw error;
      }
    };
  
    fetchData();
  }, []);

  return (
    <div>
      <h1>Facilities and operators page</h1>
      <h2>Operators:</h2>
      <p>{message}</p>
    </div>
  );
};

export default Page;
