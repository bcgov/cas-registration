export type ContentItem = {
  icon: string;
  href: string;
  title: string;
  content: string;
  links?: { title?: string; href: string; notification?: string }[];
};
