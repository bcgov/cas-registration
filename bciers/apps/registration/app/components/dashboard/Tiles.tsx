"use client";

import Tile from "@/app/components/dashboard/Tile";
import { TileContent } from "@/app/components/dashboard/types";

export default function Tiles({ tileData }: { tileData: TileContent[] }) {
  return (
    <section className="flex flex-wrap gap-x-16 lg:gap-x-24 gap-y-16 mt-4">
      {tileData &&
        tileData.map((tile) => {
          const { title, content } = tile;
          // Need to revist href vs links in the JSON data:
          // Currently if a tile has an href it will be a simple tile (see Figma reg part 2 dashboard simpler dashboard tiles)
          // eg: /app/data/dashboard_v2/bciers/my_operator.json
          // If a tile has links it will be a tile with list of links (see Figma reg part 2 BCIERS shared dashboard tiles)
          // eg: /app/data/dashboard_v2/bciers/registration.json
          const href = tile?.href;
          const links = tile?.links;
          return (
            <Tile
              key={title}
              content={content}
              href={href}
              title={title}
              links={links}
            />
          );
        })}
    </section>
  );
}
