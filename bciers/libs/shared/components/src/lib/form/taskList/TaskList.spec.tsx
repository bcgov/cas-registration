import { render } from "@testing-library/react";

import TaskList from "./TaskList";

describe("TaskList", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<TaskList />);
    expect(baseElement).toBeTruthy();
  });
});
