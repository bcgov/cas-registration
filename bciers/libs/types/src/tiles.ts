export type Condition = {
  api: string;
  field: string;
  operator: "equals" | "in" | "notIn"; // You can add more operators if needed
  value: string | string[] | null; // The type of value can vary depending on the condition
};

export type ContentItem = {
  icon: string;
  href: string;
  title: string;
  content: string;
  links?: { title: string; href: string }[];
  condition?: Condition; // Optional condition object
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
