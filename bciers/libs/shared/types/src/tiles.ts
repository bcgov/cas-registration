export type ContentItem = {
  icon: string;
  href: string;
  title: string;
  content: string;
  links?: { title: string; href: string }[];
};

export type IconMap = {
  File: JSX.Element;
  Inbox: JSX.Element;
  Layers: JSX.Element;
  Pulse: JSX.Element;
  Wrench: JSX.Element;
  Users: JSX.Element;
};
