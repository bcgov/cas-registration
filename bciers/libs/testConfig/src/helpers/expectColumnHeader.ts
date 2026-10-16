import { screen, within } from "@testing-library/react";

const titleSelector = ".MuiDataGrid-columnHeaderTitle";

export const queryColumnHeader = (title: string) =>
  screen
    .queryByText(title, { selector: titleSelector })
    ?.closest<HTMLElement>('[role="columnheader"]') ?? null;

export const getColumnHeader = (title: string) =>
  screen
    .getByText(title, { selector: titleSelector })
    .closest('[role="columnheader"]') as HTMLElement;

export const expectColumnHeader = (
  title: string,
  isSortable: boolean = true,
) => {
  const header = getColumnHeader(title);

  expect(header).toBeVisible();

  const sortButton = within(header).queryByRole("button", { name: "Sort" });

  if (isSortable) {
    expect(sortButton).toBeInTheDocument();
  } else {
    expect(sortButton).not.toBeInTheDocument();
  }
};

export default expectColumnHeader;
