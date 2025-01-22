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
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
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
        You do not currently have access to <b>{operator.legal_name}</b>.
      </p>
      <p>
        Please request access below. An administrator will need to approve your
        access request.
      </p>
      <RequestAccessButton
        operatorId={operator.id}
        operatorName={operator.legal_name}
      />
    </div>
  );

  const operatorHasNoAdmin: JSX.Element = (
    <div data-testid="has-no-admin-message">
      <p>
        The operator <b>{operator.legal_name}</b> does not have an administrator
        yet.
      </p>
      <p>
        Request administrator access if you would like to be the administrator
        for this
        <br />
        operator. Ministry staff will review your request.
      </p>
      <p>
        As an administrator, you can approve any additional users requested
        access to
        <br />
        the operator and assign additional administrators.
      </p>
      <RequestAccessButton
        operatorId={operator.id}
        operatorName={operator.legal_name}
        isAdminRequest={true}
      />
    </div>
  );

  return (
    <section className="text-center my-auto flex flex-col gap-3">
      {hasConfirmedOperator ? (
        <>
          <span>
            <WarningRoundedIcon sx={{ color: "#fcba19", fontSize: "40px" }} />
          </span>
          <div>{hasAdmin ? operatorHasAdminJSX : operatorHasNoAdmin}</div>
          <Link
            href="#"
            className="underline hover:no-underline"
            style={{ color: BC_GOV_LINKS_COLOR, fontSize: "16px" }}
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
              Yes this is my operator
            </Button>
            <span className="text-sm">
              This is not my operator.{" "}
              <Link
                href="/select-operator"
                className="underline hover:no-underline text-sm"
                style={{ color: BC_GOV_LINKS_COLOR }}
                onClick={() => setHasConfirmedOperator(false)}
              >
                Go back
              </Link>
            </span>
          </div>
        </>
      )}
    </section>
  );
}
