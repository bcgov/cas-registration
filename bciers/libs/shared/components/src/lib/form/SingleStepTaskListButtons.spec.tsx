import { render } from "@testing-library/react";

import SingleStepTaskListButtons from "./SingleStepTaskListButtons";

describe("SingleStepTaskListButtons", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SingleStepTaskListButtons />);
    expect(baseElement).toBeTruthy();
  });
});
