//  type for ContentItem used to build dashboard content tiles
export interface TileContent {
  title: string;
  content: string;
  href?: string;
  links?: { title: string; href: string }[];
}
