"use client";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import SyncIcon from "@mui/icons-material/Sync";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";
import FormBase from "@bciers/components/form/FormBase";
import {
  operationReviewSchema,
  operationReviewUiSchema,
} from "@reporting/src/app/utils/jsonSchema/operations";

export default function OperationReview({
  formData,
  version_id,
}: {
  formData: any;
  version_id: UUID;
}) {
  const customStepNames = [
    "Operation Information",
    "Facilities Information",
    "Compliance Summary",
    "Sign-off & Submit",
  ];

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4">
        <MultiStepHeader step={0} steps={customStepNames} />
      </div>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Operation Information
            </Typography>
            <List component="nav">
              <ListItem button selected>
                <ListItemIcon>
                  <CheckCircleOutline htmlColor="green" />
                </ListItemIcon>
                <ListItemText
                  primary="Review operation information"
                  primaryTypographyProps={{ color: "#1A5A96" }}
                />
              </ListItem>
              <ListItem button>
                <ListItemText primary="Review facilities" />
              </ListItem>
              <ListItem button>
                <ListItemText primary="Person responsible" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Typography variant="h6" color="#38598A" fontSize="24px" gutterBottom>
            Review operation information
          </Typography>
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#DCE9F6", color: "#313132" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <InfoIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                The information shown on this page is data entered in
                registration. You can edit it here but it will only apply to
                this report. To make edits for all of your reports, please edit
                this information in registration.
              </Typography>
            </Box>
          </Paper>
          <Typography
            variant="body2"
            color="#38598A"
            fontSize="16px"
            gutterBottom
          >
            Please ensure this information was accurate for Dec 31 2024
          </Typography>
          <FormBase
            schema={operationReviewSchema}
            uiSchema={operationReviewUiSchema}
            formData={formData}
            onSubmit={async (data: { formData?: any }) => {
              const method = "POST";
              const endpoint = `reporting/save-report/${version_id}`;
              const pathToRevalidate = `reporting/save-report/${version_id}`;
              const formDataObject = JSON.parse(JSON.stringify(data.formData));
              const body = {
                operator_legal_name:
                  formDataObject.operatorLegalName ||
                  "default_value_if_missing",
                operator_trade_name:
                  formDataObject.operatorTradeName ||
                  "default_value_if_missing",
                operation_name:
                  formDataObject.operationName || "default_value_if_missing",
                operation_type:
                  formDataObject.operationType || "default_value_if_missing",
                operation_bcghgid:
                  formDataObject.BCGHGID || "default_value_if_missing",
                bc_obps_regulated_operation_id:
                  formDataObject.BOROID || "default_value_if_missing",
                operation_representative_name:
                  formDataObject.operationRepresentative ||
                  "default_value_if_missing",
              };
              await actionHandler(endpoint, method, pathToRevalidate, {
                body: JSON.stringify(body),
                headers: {
                  "Content-Type": "application/json",
                  accept: "application/json",
                },
              });
            }}
          />

          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={4}>
              <Button variant="outlined" startIcon={<SyncIcon />}>
                Sync latest data from registration
              </Button>
              <Box mt={2}>
                <Button variant="outlined" fullWidth>
                  Cancel
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}></Grid>
            <Grid
              item
              xs={12}
              sm={4}
              display="flex"
              justifyContent="flex-end"
              alignItems="flex-start"
            >
              <Button variant="contained" color="primary">
                Save and continue
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
