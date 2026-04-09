import { render, screen } from "@testing-library/react";
import AppVersion from "./AppVersion";

describe("AppVersion component", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("renders the version when NEXT_PUBLIC_APP_VERSION is set", () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_APP_VERSION: "1.2.3" };

    render(<AppVersion />);

    expect(screen.getByText("v1.2.3")).toBeVisible();
  });

  it("renders nothing when NEXT_PUBLIC_APP_VERSION is not set", () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_APP_VERSION: undefined };

    const { container } = render(<AppVersion />);

    expect(container).toBeEmptyDOMElement();
  });
});
