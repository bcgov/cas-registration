import React from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
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

const OperationReview = () => {
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body2">Operator legal name</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    defaultValue="operatorlegalname"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body2">Operator trade name</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    defaultValue="operatortradename"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body2">Operation name</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    defaultValue="operationname"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body2">Operation type</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Select
                    fullWidth
                    defaultValue="Linear facility operation"
                    variant="outlined"
                  >
                    <MenuItem value="Linear facility operation">
                      Linear facility operation
                    </MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body2">BCGHG ID</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    defaultValue="OperationBCGHGID"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body2">BORO ID</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    defaultValue="boroidhere"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body2">Reporting activities</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Select fullWidth defaultValue="activity1" variant="outlined">
                    <MenuItem value="activity1">activity1</MenuItem>
                    <MenuItem value="activity2">activity2</MenuItem>
                    <MenuItem value="activity3">activity3</MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body2">Regulated products</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Select fullWidth defaultValue="product1" variant="outlined">
                    <MenuItem value="product1">product1</MenuItem>
                    <MenuItem value="product2">product2</MenuItem>
                    <MenuItem value="product3">product3</MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body2">
                    Operation representative
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Select fullWidth defaultValue="sam smith" variant="outlined">
                    <MenuItem value="sam smith">sam smith</MenuItem>
                    <MenuItem value="belinda g">belinda g</MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
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
};

export default OperationReview;
