"use client";

import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => router.back()}
      aria-label="Back"
    >
      Back
    </Button>
  );
};

export default BackButton;
