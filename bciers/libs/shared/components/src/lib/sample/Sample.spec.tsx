import { render } from "@testing-library/react";

import { Sample } from "./Sample";

describe("Sample", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<Sample exampleProp="test" />);
    expect(baseElement).toBeTruthy();
  });
});
