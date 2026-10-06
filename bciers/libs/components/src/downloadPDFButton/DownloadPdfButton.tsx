"use client";
import React, { JSX } from "react";
import { Box, Button, Typography } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";

interface Props {
  label?: string;
  description?: string | JSX.Element;
}

const DownloadPdfButton: React.FC<Props> = ({
  label = "Save as PDF",
  description,
}) => {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Box className="print-controls">
      <Button
        variant="outlined"
        startIcon={<PrintIcon />}
        onClick={handlePrint}
        // hide the button itself when printing className="print:hidden"
      >
        {label}
      </Button>
      <Typography variant="body2" className="mt-4 mb-4 print:hidden">
        {description ||
          "Or use your browser’s print function (Control/Command + P) to save this report as PDF."}
      </Typography>
    </Box>
  );
};

export default DownloadPdfButton;
