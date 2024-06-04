import { render } from "@testing-library/react";

import SingleStepTaskListForm from "./SingleStepTaskListForm";

describe("SingleStepTaskListForm", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<SingleStepTaskListForm />);
    expect(baseElement).toBeTruthy();
  });
});
