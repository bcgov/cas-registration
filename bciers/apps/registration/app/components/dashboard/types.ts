export interface IconMap {
  Inbox: () => JSX.Element;
  Layers: () => JSX.Element;
  Wrench: () => JSX.Element;
  Users: () => JSX.Element;
}

export interface IncomingTileData {
  tileType: string;
  links: string[];
}

// 📐 type for ContentItem used to build dashboard content tiles
export interface TileContent {
  title: string;
  icon: () => JSX.Element;
  content: string;
}

export interface TileContentWithLink extends TileContent {
  link: string;
}

export interface TileContentWithLinks extends TileContent {
  links: { title?: string; href?: string; notification?: string }[];
}
