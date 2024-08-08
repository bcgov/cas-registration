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
import FormBase from "@bciers/components/form/FormBase";
import {
  facilityReviewSchema,
  facilityReviewUiSchema,
} from "@reporting/src/data/jsonSchema/facilities";

interface Props {
  formData: any;
  version_id: number;
}

const submitHandler = async (data: { formData?: any }, version_id: number) => {
  const method = "POST";
  const endpoint = `reporting/report-version/${version_id}/report-operation`;
  const pathToRevalidate = `reporting/report-version/${version_id}/report-operation`;
  const formDataObject = JSON.parse(JSON.stringify(data.formData));
  await actionHandler(endpoint, method, pathToRevalidate, {
    body: JSON.stringify(formDataObject),
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
  });
};

export default function FacilityReview({
  formData,
  version_id,
}: Readonly<Props>) {
  const customStepNames = [
    "Operation Information",
    "Facilities Information",
    "Compliance Summary",
    "Sign-off & Submit",
  ];

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4">
        <MultiStepHeader stepIndex={1} steps={customStepNames} />
      </div>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Facility1 Information
            </Typography>
            <List component="nav">
              <ListItem button selected>
                <ListItemText
                  primary="Review facility information"
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
            Review facility information
          </Typography>
          <FormBase
            schema={facilityReviewSchema}
            uiSchema={facilityReviewUiSchema}
            formData={formData}
            onSubmit={(data) => submitHandler(data, version_id)}
          />

          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={4}>
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
                Continue
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
