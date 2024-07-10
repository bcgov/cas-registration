"use client";

import { useMemo, useState } from "react";
import DataGrid from "@bciers/components/datagrid/DataGrid";
import { ContactRow } from "./types";
import HeaderSearchCell from "@bciers/components/datagrid/cells/HeaderSearchCell";
import ActionCellFactory from "../datagrid/ActionCellFactory";
import fetchContactsPageData from "./fetchContactsPageData";
import contactColumns from "../datagrid/models/contacts/contactColumns";
import contactGroupColumns from "../datagrid/models/contacts/contactGroupColumns";

const ContactsActionCell = ActionCellFactory({
  href: "#",
  replace: true,
  className: "no-underline text-bc-link-blue whitespace-normal",
  cellText: "View Details",
});

const ContactDataGrid = ({
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

  const ActionCell = useMemo(() => ContactsActionCell(), []);

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

export default ContactDataGrid;
