// Type representing a condition that must be evaluated to show/hide a ContentItem or LinkItem
export type Condition = {
  api: string; // The API endpoint to call
  field: string; // The field in the API response to evaluate
  operator: "equals" | "notEquals" | "in" | "notIn" | "exists" | "notExists"; // Comparison operator
  value: any; // The value to compare against
};

// Type representing a link within a ContentItem that can also have its own conditions
export type LinkItem = {
  href: string; // URL the link points to
  title: string; // The title of the link
  conditions?: Condition[]; // Optional array of conditions to display the link
  allowedRoles?: string[]; // Optional array of roles that can see the tile
  target?: string; // Optional target attribute for the link (e.g., '_blank', '_self')
  rel?: string; // Optional rel attribute for the link (e.g., 'noopener noreferrer')
};

// Main ContentItem type, including optional conditions and links
export type ContentItem = {
  icon: string; // Icon to display on the dashboard tile
  href: string; // URL the tile points to
  title: string; // Title of the dashboard tile
  content: string; // Description or content of the dashboard tile
  links?: LinkItem[]; // Optional array of links, each can have a condition
  conditions?: Condition[]; // Optional array of conditions to display the tile
  target?: string; // Optional target attribute for the tile's main link
  rel?: string; // Optional rel attribute for the tile's main link
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
