import NullTaskListItem from "./NullTaskListItem";
import PageTaskListItem from "./PageTaskListItem";
import SectionTaskListItem from "./SectionTaskListItem";
import taskListItemFactory from "./taskListItemFactory";

describe("The task list item factory", () => {
  const factoryUnderTest = taskListItemFactory;

  it("Returns a Null object when an unknown type is passed in", () => {
    expect(factoryUnderTest({ type: "Invalid" } as any)).toBe(NullTaskListItem);
  });
  it("Returns a Page component when a Page type is passed in", () => {
    expect(factoryUnderTest({ type: "Page", title: "" })).toBe(
      PageTaskListItem,
    );
  });
  it("Returns a Section component when a Section type is passed in", () => {
    expect(factoryUnderTest({ type: "Section", title: "" })).toBe(
      SectionTaskListItem,
    );
  });
  it("Returns a Section component when a Subsection type is passed in", () => {
    expect(factoryUnderTest({ type: "Subsection", title: "" })).toBe(
      SectionTaskListItem,
    );
  });
});
