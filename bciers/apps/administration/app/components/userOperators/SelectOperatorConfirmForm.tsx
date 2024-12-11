"use client";

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
import RequestAccessButton from "../buttons/RequestAccessButton";
import Link from "next/link";
import { BC_GOV_LINKS_COLOR, DARK_GREY_BG_COLOR } from "@bciers/styles/colors";
import Button from "@mui/material/Button";
import { Operator } from "./types";

interface ConfirmSelectedOperatorFormProps {
  operator: Operator;
  hasAdmin: boolean;
}

export default function SelectOperatorConfirmForm({
  operator,
  hasAdmin,
}: Readonly<ConfirmSelectedOperatorFormProps>) {
  const [hasConfirmedOperator, setHasConfirmedOperator] = useState(false);

  const operatorHasAdminJSX: JSX.Element = (
    <div data-testid="has-admin-message">
      <p>
        Looks like you do not have access to <b>{operator.legal_name}</b>.
      </p>
      <p>
        An Operation Representative with Administrator access will need to
        approve your access request.
      </p>
      <p>Please confirm below if you would like to submit an access request.</p>
      <RequestAccessButton
        operatorId={operator.id}
        operatorName={operator.legal_name}
      />
    </div>
  );

  const operatorHasNoAdmin: JSX.Element = (
    <div data-testid="has-no-admin-message">
      <p>
        Looks like operator <b>{operator.legal_name}</b> does not have
        Administrator access set up.
      </p>
      <p>
        Would you like to request Administrator access as an Operation
        Representative?
      </p>
      <p>
        Please note that you will be responsible for approving any additional
        users requesting access to the operator.
      </p>
      <RequestAccessButton
        operatorId={operator.id}
        operatorName={operator.legal_name}
        isAdminRequest={true}
      />
    </div>
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
            href="#"
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
                      <b>Street Address</b>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {operator.street_address || "-"}
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
              Yes, this is my operator.
            </Button>
            <span className="text-sm">
              This is not my operator.{" "}
              <Link
                href="/select-operator"
                className="underline hover:no-underline text-sm"
                style={{ color: BC_GOV_LINKS_COLOR }}
                onClick={() => setHasConfirmedOperator(false)}
              >
                Return.
              </Link>
            </span>
          </div>
        </>
      )}
    </section>
  );
}
