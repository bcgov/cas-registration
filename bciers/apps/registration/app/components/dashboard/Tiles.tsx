"use client";

import Tile from "@/app/components/dashboard/Tile";
import {
  IncomingTileData,
  TileContentWithHref,
  TileContentWithLinks,
} from "@/app/components/dashboard/types";

export default function Tiles({
  tileData,
  tileMap,
}: {
  tileData: IncomingTileData[];
  tileMap: { [key: string]: TileContentWithHref | TileContentWithLinks };
}) {
  return (
    <section className="flex flex-wrap gap-x-16 lg:gap-x-24 gap-y-16 mt-4">
      {tileData &&
        tileData.map((tile) => {
          const { tileType } = tile;
          const tileContent = tileMap[tileType];
          const { description, title } = tileContent;
          // Need to revist href vs links
          const href = (tileContent as TileContentWithHref)?.href;
          return (
            <Tile
              key={tileType}
              description={description}
              href={href}
              title={title}
            />
          );
        })}
    </section>
  );
}
