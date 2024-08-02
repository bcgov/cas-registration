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
    return `contacts/${params.row.id}?contactsTitle=${params.row.first_name} ${params.row.last_name}`;
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

  return (
    <DataGrid
      columns={columns}
      columnGroupModel={columnGroup}
      fetchPageData={fetchContactsPageData}
      paginationMode="server"
      initialData={initialData}
    />
  );
};

export default ContactsDataGrid;
