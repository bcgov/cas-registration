import { ContentItem } from "@bciers/types/tiles";
import Tile from "./Tile";
import evalDashboardDataCondition from "@bciers/utils/evalDashboardDataCondition";

const Tiles = async ({ tiles }: { tiles: ContentItem[] }) => {
  // Evaluate display conditions in the dashboard data
  tiles = await evalDashboardDataCondition(tiles);
  return (
    <section className="w-full flex flex-wrap gap-x-8 lg:gap-x-24 gap-y-16 my-8">
      {tiles &&
        tiles.map((tile) => {
          const { title } = tile;
          return <Tile key={title} {...tile} />;
        })}
    </section>
  );
};

export default Tiles;
