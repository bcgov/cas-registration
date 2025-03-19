import { ContentItem } from "@bciers/types/tiles";
import Tile from "./Tile";

const Tiles = ({ tiles }: { tiles: ContentItem[] }) => {
  return (
    <section className="w-full flex flex-wrap gap-x-8 lg:gap-x-24 gap-y-16 my-8">
      {tiles?.map((tile) => {
        const { title } = tile;
        return <Tile key={title} {...tile} />;
      })}
    </section>
  );
};

export default Tiles;
