"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { ContactRow } from "./types";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import ActionCellFactory from "@bciers/components/datagrid/cells/ActionCellFactory";
import fetchContactsPageData from "./fetchContactsPageData";
import contactColumns from "../datagrid/models/contacts/contactColumns";
import contactGroupColumns from "../datagrid/models/contacts/contactGroupColumns";
import { GridRenderCellParams } from "@mui/x-data-grid";

const ContactsActionCell = ActionCellFactory({
  generateHref: (params: GridRenderCellParams) => {
    return `/contacts/${params.row.id}?contacts_title=${params.row.first_name} ${params.row.last_name}`;
  },
  cellText: "View Details",
});

const ContactsDataGrid = ({
  initialData,
  isExternalUser,
}: {
  isExternalUser: boolean;
  initialData: {
    rows: ContactRow[];
    row_count: number;
  };
}) => {
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  const SearchCell = useMemo(
    () => HeaderSearchCell({ lastFocusedField, setLastFocusedField }),
    [lastFocusedField, setLastFocusedField],
  );

  const ActionCell = useMemo(() => ContactsActionCell, []);

  const columns = useMemo(
    () => contactColumns(isExternalUser, ActionCell),
    [ActionCell, isExternalUser],
  );

  const columnGroup = useMemo(
    () => contactGroupColumns(isExternalUser, SearchCell),
    [SearchCell, isExternalUser],
  );

  // the mui grid requires a unique id, and since we can multiple rows with the same contact for different operators, we can't use the contact's id alone
  function getRowId(row: ContactRow) {
    const operator = row?.operators__legal_name
      ? row.operators__legal_name
      : "";
    return row.id + operator;
  }

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchContactsPageData}
      paginationMode="server"
      initialData={initialData}
      getRowId={getRowId}
    />
  );
};

export default ContactsDataGrid;
