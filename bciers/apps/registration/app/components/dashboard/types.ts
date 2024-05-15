export interface IncomingTileData {
  tileType: string;
  links?: string[];
}

// 📐 type for ContentItem used to build dashboard content tiles
export interface TileContent {
  title: string;
  description: string;
}

export interface TileContentWithHref extends TileContent {
  href: string;
}

export interface TileContentWithLinks extends TileContent {
  links: { title: string; href: string }[];
}
