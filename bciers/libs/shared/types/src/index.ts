export type ContentItem = {
  title: string;
  icon: string;
  content: string;
  links?: { title?: string; href: string; notification?: string }[];
};
