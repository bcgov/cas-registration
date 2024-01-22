"use client";
import { Operator } from "@/app/components/routes/select-operator/form/types";

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import WarningIcon from "@mui/icons-material/Warning";
import RequestAccessButton from "@/app/components/button/RequestAccessButton";
import Link from "next/link";
import { BC_GOV_LINKS_COLOR, DARK_GREY_BG_COLOR } from "@/app/styles/colors";
import Button from "@mui/material/Button";

interface ConfirmSelectedOperatorFormProps {
  operator: Operator;
  hasAdmin: boolean;
}

export default function ConfirmSelectedOperatorForm({
  operator,
  hasAdmin,
}: Readonly<ConfirmSelectedOperatorFormProps>) {
  const [hasConfirmedOperator, setHasConfirmedOperator] = useState(false);

  const operatorHasAdminJSX: JSX.Element = (
    <>
      <p>
        Looks like you do not have access to <b>{operator.legal_name}</b>
        <br />
        You will need the Operation Representative of{" "}
        <b>{operator.legal_name}</b> to grant your access.
      </p>
      <p>Please confirm below if you would like to request access.</p>
      <RequestAccessButton operatorId={operator.id} />
    </>
  );

  const operatorHasNoAdmin: JSX.Element = (
    <>
      <p>
        Looks like the operator <b>{operator.legal_name}</b> does not have an
        Operation Representative.
      </p>
      <p>Would you like to request access as its Operation Representative?</p>
      <RequestAccessButton operatorId={operator.id} isAdminRequest={true} />
    </>
  );

  return (
    <section className="text-center my-auto text-2xl flex flex-col gap-3">
      {hasConfirmedOperator ? (
        <>
          <span>
            <WarningIcon sx={{ color: "#ff0e0e", fontSize: 50 }} />
          </span>
          <div>{hasAdmin ? operatorHasAdminJSX : operatorHasNoAdmin}</div>
          <Link
            href=""
            className="underline hover:no-underline"
            style={{ color: BC_GOV_LINKS_COLOR }}
            onClick={() => setHasConfirmedOperator(false)}
          >
            Go Back
          </Link>
        </>
      ) : (
        <>
          <p>Kindly confirm if this is the operator that you represent.</p>
          <Box display="flex" justifyContent="center">
            <TableContainer
              component={Paper}
              sx={{ backgroundColor: DARK_GREY_BG_COLOR, width: "auto" }}
            >
              <Table sx={{ width: "auto" }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <b>Legal Name</b>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {operator.legal_name || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <b>Trade Name</b>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {operator.trade_name || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <b>CRA Business Number</b>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {operator.cra_business_number}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <b>Physical Address</b>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {operator.physical_street_address || "-"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <div className="flex flex-col items-center gap-5 mt-10">
            <Button
              sx={{ textTransform: "none" }} //to remove uppercase text
              aria-label="Yes this is my operator"
              color="primary"
              variant="contained"
              type="button"
              onClick={() => setHasConfirmedOperator(true)}
            >
              Yes this is my operator
            </Button>
            <span className="text-sm">
              This is not my operator.{" "}
              <Link
                href="/dashboard/select-operator"
                className="underline hover:no-underline text-sm"
                style={{ color: BC_GOV_LINKS_COLOR }}
                onClick={() => setHasConfirmedOperator(false)}
              >
                Return
              </Link>
            </span>
          </div>
        </>
      )}
    </section>
  );
}
