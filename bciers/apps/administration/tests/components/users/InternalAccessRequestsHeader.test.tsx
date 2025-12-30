import { render, screen } from "@testing-library/react";
import InternalAccessRequestsHeader from "apps/administration/app/components/users/InternalAccessRequestsHeader";

describe("Internal Access Requests Header", () => {
  it("renders the Users heading", () => {
    render(<InternalAccessRequestsHeader />);
    expect(screen.getByRole("heading", { name: /users/i })).toBeVisible();
  });
});
