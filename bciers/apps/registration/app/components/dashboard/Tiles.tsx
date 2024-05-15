"use client";

import {
  IncomingTileData,
  TileContentWithLink,
  TileContentWithLinks,
} from "@/app/components/dashboard/types";

export default function Tiles({
  tileData,
  tileMap,
}: {
  tileData: IncomingTileData[];
  tileMap: { [key: string]: TileContentWithLink | TileContentWithLinks };
}) {
  return (
    <section className="flex flex-wrap gap-x-16 lg:gap-x-24 gap-y-16 mt-4">
      {tileData &&
        tileData.map((tile) => {
          const { tileType } = tile;
          const tileContent = tileMap[tileType];
          const { title, icon } = tileContent;
          return (
            <div key={title} className="dashboard-tile-container">
              <h2 className="flex items-center m-0">
                {icon()}
                <div className="ml-2">{title}</div>
              </h2>
            </div>
          );
        })}
    </section>
  );
}
