"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import RequestAccessButton from "../buttons/RequestAccessButton";
import Link from "next/link";
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

  const operatorHasAdminJSX: ReactNode = (
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

  const operatorHasNoAdmin: ReactNode = (
    <div data-testid="has-no-admin-message">
      <p>
        The operator <b>{operator.legal_name}</b> does not have an administrator
        yet.
      </p>
      <p>
        Request administrator access if you would like to be the administrator
        for this operator. Ministry staff will review your request.
      </p>
      <p>
        As an administrator, you can approve any additional users requesting
        access to the operator and assign additional administrators.
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
            <WarningRoundedIcon className="text-bc-yellow text-[40px]" />
          </span>
          <div>{hasAdmin ? operatorHasAdminJSX : operatorHasNoAdmin}</div>
          <Link
            href="#"
            className="underline hover:no-underline text-bc-link-blue text-base"
            onClick={() => setHasConfirmedOperator(false)}
          >
            Go Back
          </Link>
        </>
      ) : (
        <>
          <p>Kindly confirm if this is the operator that you represent.</p>
          <Box className="flex justify-center">
            <TableContainer
              component={Paper}
              className="bg-bc-bg-dark-grey w-auto"
            >
              <Table className="w-auto">
                <TableBody>
                  <TableRow>
                    <TableCell className="border-b-0">
                      <b>Legal Name</b>
                    </TableCell>
                    <TableCell className="border-b-0">
                      {operator.legal_name || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-b-0">
                      <b>Trade Name</b>
                    </TableCell>
                    <TableCell className="border-b-0">
                      {operator.trade_name || "-"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-b-0">
                      <b>CRA Business Number</b>
                    </TableCell>
                    <TableCell className="border-b-0">
                      {operator.cra_business_number}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-b-0">
                      <b>Street Address</b>
                    </TableCell>
                    <TableCell className="border-b-0">
                      {operator.street_address || "-"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <div className="flex flex-col items-center gap-5 mt-10">
            <Button
              className="normal-case" //to remove uppercase text
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
                className="underline hover:no-underline text-sm text-bc-link-blue"
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
