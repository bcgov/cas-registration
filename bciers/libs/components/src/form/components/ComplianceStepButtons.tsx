"use client";

import {
  BC_GOV_BACKGROUND_COLOR_BLUE,
  BC_GOV_LINKS_COLOR,
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
} from "@bciers/styles";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";

interface ComplianceStepButtonsProps {
  backUrl?: string;
  continueUrl: string;
  isSaving?: boolean;
  isRedirecting?: boolean;
  saveButtonDisabled?: boolean;
  submitButtonDisabled?: boolean;
  saveAndContinue?: () => void;
  noFormSave?: () => void;
  noSaveButton?: boolean;
  generateInvoice?: () => void;
}

const ComplianceStepButtons: React.FunctionComponent<
  ComplianceStepButtonsProps
> = ({ backUrl, continueUrl, isSaving, isRedirecting, generateInvoice }) => {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mt: 2,
        mb: 2,
      }}
    >
      <div>
        {backUrl && (
          <Button
            variant="outlined"
            onClick={() => router.push(backUrl)}
            disabled={isSaving || isRedirecting}
            data-testid="back-button"
            sx={{
              padding: "16px 41px",
              borderColor: BC_GOV_BACKGROUND_COLOR_BLUE,
              color: BC_GOV_LINKS_COLOR,
              "&:hover": {
                borderColor: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
              },
            }}
          >
            Back
          </Button>
        )}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        {generateInvoice && (
          <Button
            variant="outlined"
            onClick={generateInvoice}
            disabled={isSaving || isRedirecting}
            data-testid="generate-invoice-button"
            sx={{
              padding: "16px 41px",
              borderColor: BC_GOV_BACKGROUND_COLOR_BLUE,
              color: BC_GOV_LINKS_COLOR,
              "&:hover": {
                borderColor: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
              },
            }}
          >
            Generate Compliance Invoice
          </Button>
        )}
        <Button
          variant="contained"
          onClick={() => router.push(continueUrl)}
          disabled={isSaving || isRedirecting}
          data-testid="continue-button"
          sx={{
            padding: "16px 41px",
            backgroundColor: "#003366",
            "&:hover": {
              backgroundColor: "#002952",
            },
          }}
        >
          Continue
        </Button>
      </div>
    </Box>
  );
};

export default ComplianceStepButtons;
