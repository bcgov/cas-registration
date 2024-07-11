// 🛠️ Function to  update dashboard json data href replacing a static stub text with a dynamic value.
/*
e.g.
 
  //🔗 replace the static href with dynamic href...
  const data = (await fetchDashboardData(...) as ContentItem[];
  const newData = replaceParams(
    data,
    "static-href-in-dashboard-data",
    `dynamic-href-from-workflow-data`,
  );
 */

import { ContentItem } from "../types/src/tiles";

const updateDashboardDataHref = (
  items: ContentItem[],
  replaceValue: string,
  newValue: string,
): ContentItem[] => {
  return items.map((item) => ({
    ...item,
    href: item.href.replace(replaceValue, newValue),
  }));
};
export default updateDashboardDataHref;
