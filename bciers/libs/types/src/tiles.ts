export type Condition = {
  api: string;
  field: string;
  operator: "equals" | "in" | "notIn"; // You can add more operators if needed
  value: string | string[] | null; // The type of value can vary depending on the condition
};

// Define a type for individual LinkItems
export type LinkItem = {
  title: string;
  href: string;
  condition?: Condition; // Optional condition for each link
};

// Define the ContentItem type, which may include an array of LinkItems
export type ContentItem = {
  icon: string;
  href: string;
  title: string;
  content: string;
  links?: LinkItem[]; // Array of LinkItems, each with a condition
  condition?: Condition; // Optional condition for the ContentItem itself
};

export type IconMap = {
  File: JSX.Element;
  Inbox: JSX.Element;
  Entrance: JSX.Element;
  Layers: JSX.Element;
  Pulse: JSX.Element;
  Wrench: JSX.Element;
  Users: JSX.Element;
};
