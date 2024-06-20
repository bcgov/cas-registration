import { ContentItem } from "./types";
import Tile from "./Tile";

const Tiles = ({ tiles }: { tiles: ContentItem[] }) => {
  return (
    <section className="w-full flex flex-wrap gap-x-8 lg:gap-x-24 gap-y-16 my-4">
      {tiles &&
        tiles.map((tile) => {
          const { title } = tile;
          return <Tile key={title} {...tile} />;
        })}
    </section>
  );
};

export default Tiles;
