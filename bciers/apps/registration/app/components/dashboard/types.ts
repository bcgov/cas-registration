export interface IncomingTileData {
  type: string;
  links?: { type: string }[];
}

// 📐 type for ContentItem used to build dashboard content tiles
export interface TileContent {
  title: string;
  content: string;
  path?: string;
  links?: { title: string; href: string }[];
}
