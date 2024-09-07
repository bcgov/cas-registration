"use client";
import { Box, Button, Grid, Typography } from "@mui/material";
import ReportSteps from "../navigation/ReportSteps";
import FormBase from "@bciers/components/form/FormBase";
import {
  personResponsibleManualEntrySchema,
  personResponsibleManualEntryUiSchema,
} from "@reporting/src/data/jsonSchema/personResponsible";
import { ReportVersionPageProps } from "../../utils/types";
import formTheme from "@bciers/components/form/theme/defaultTheme";

const PersonResponsibleForm: React.FC<ReportVersionPageProps> = ({
  version_id,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <ReportSteps />
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          tasklist
        </Grid>
        <Grid item xs={12} md={9}>
          <Typography variant="h6" color="#38598A" fontSize="24px" gutterBottom>
            Person responsible
          </Typography>

          <FormBase
            schema={personResponsibleManualEntrySchema}
            uiSchema={personResponsibleManualEntryUiSchema}
            formData={{}}
            onSubmit={(data) => console.log(data)}
          />

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
    </Box>
  );
};

export default PersonResponsibleForm;
