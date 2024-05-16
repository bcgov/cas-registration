"use client";

import Tile from "@/app/components/dashboard/Tile";
import { TileContent } from "@/app/components/dashboard/types";

export default function Tiles({ tileData }: { tileData: TileContent[] }) {
  return (
    <section className="flex flex-wrap gap-x-16 lg:gap-x-24 gap-y-16 mt-4">
      {tileData &&
        tileData.map((tile) => {
          const { title, content } = tile;
          // Need to revist href vs links
          const path = tile?.path;
          const links = tile?.links;
          return (
            <Tile
              key={title}
              content={content}
              path={path}
              title={title}
              links={links}
            />
          );
        })}
    </section>
  );
}
