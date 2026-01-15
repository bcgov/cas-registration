import { render, screen } from "@testing-library/react";
import UserOperatorsHeader from "@/administration/app/components/userOperators/UserOperatorsHeader";
import { expect } from "vitest";

describe("UserOperatorsHeader component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders UserOperatorsHeader with the note on top of the page", async () => {
    render(await UserOperatorsHeader());
    expect(screen.getByTestId("note")).toBeVisible();
    expect(
      screen.getByText(
        /once "approved", the user will have access to their operator dashboard with full admin permissions,and can grant access and designate permissions to other authorized users there\./i,
      ),
    ).toBeVisible();
  });
});
