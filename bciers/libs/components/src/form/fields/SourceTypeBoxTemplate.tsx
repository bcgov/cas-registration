"use client";
import { FieldTemplateProps } from "@rjsf/utils";
import {
  Grid,
  Avatar,
  Card,
  CardActions,
  CardHeader,
  Collapse,
  IconButton,
  Typography,
  makeStyles,
  Paper
} from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useState } from "react";

function SourceTypeBoxTemplate({
  classNames,
  id,
  style,
  label,
  help,
  required,
  description,
  errors,
  children,
  uiSchema,
}: FieldTemplateProps) {
  const [expand, setExpand] = useState(true);
  return (
    <>
      <Paper className={classNames}>
        <Card style={{ textAlign: "left" }}>
          <Grid container spacing={1}>
            <Grid item xs={10}>
              <CardHeader sx={{color: 'blue'}}
                titleTypographyProps={{variant:'h6', color:'#38598A'}}
                title={label}
              />
            </Grid>
            <Grid item xs={1}>
            <CardActions>
                <IconButton onClick={() => setExpand(!expand)}>
                  {expand ? <ArrowDropUpIcon/> : <ArrowDropDownIcon/>}
                </IconButton>

            </CardActions>
            </Grid>
          </Grid>
          <Collapse in={expand} sx={{marginLeft: '30px', marginRight: "30px", marginTop: "10px"}}>
            <Typography sx={{ bgcolor: '#dfe5f0', paddingLeft: '30px', paddingRight: "30px", paddingTop: "10px"}}>
              {description}
              {children}
              {errors}
              {help}
            </Typography>
          </Collapse>
        </Card>
      </Paper>
    </>
  );
}

export default SourceTypeBoxTemplate;
