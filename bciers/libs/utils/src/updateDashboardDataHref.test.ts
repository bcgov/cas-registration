import { describe, expect, it } from "vitest";
import updateDashboardDataHref from "@bciers/utils/src/updateDashboardDataHref";
import { ContentItem } from "@bciers/types/tiles";

const items: ContentItem[] = [
  {
    icon: "icon1",
    href: "/dashboard/item1",
    title: "Dashboard Item 1",
    content: "This is item 1",
    links: [{ href: "/link1", title: "Link 1", conditions: [] }],
    conditions: [],
  },
  {
    icon: "icon2",
    href: "/dashboard/item2",
    title: "Dashboard Item 2",
    content: "This is item 2",
    links: [{ href: "/link2", title: "Link 2", conditions: [] }],
    conditions: [],
  },
];

describe("updateDashboardDataHref function", () => {
  it("should update href by replacing static value and appending title", () => {
    const replaceValue = "/dashboard";
    // Mock functions for getNewValue and getTitle
    const getNewValue = (item: ContentItem) => `/newpath/${item.title}`;
    const getTitle = (item: ContentItem) => `?title=${item.title}`;

    // Call the function with the mocks
    const updatedItems = updateDashboardDataHref(
      items,
      replaceValue,
      getNewValue,
      getTitle,
    );

    // Expectations for the updated items
    expect(updatedItems).toEqual([
      {
        icon: "icon1",
        href: "/newpath/Dashboard Item 1/item1?title=Dashboard Item 1",
        title: "Dashboard Item 1",
        content: "This is item 1",
        links: [{ href: "/link1", title: "Link 1", conditions: [] }],
        conditions: [],
      },
      {
        icon: "icon2",
        href: "/newpath/Dashboard Item 2/item2?title=Dashboard Item 2",
        title: "Dashboard Item 2",
        content: "This is item 2",
        links: [{ href: "/link2", title: "Link 2", conditions: [] }],
        conditions: [],
      },
    ]);
  });

  it("should return items unchanged if no href matches the replace value", () => {
    const replaceValue = "/notfound";
    const getNewValue = (item: ContentItem) => `/newpath/${item.title}`;
    const updatedItems = updateDashboardDataHref(
      items,
      replaceValue,
      getNewValue,
    );

    // Since the href does not match the replaceValue, it should remain the same
    expect(updatedItems).toEqual(items);
  });
});
