"use client";
import { ContentItem } from "@bciers/types";

export default async function Tiles({ tiles }: { tiles: ContentItem[] }) {
  return (
    <section className="flex flex-wrap gap-x-16 lg:gap-x-24 gap-y-16 mt-4">
      {tiles &&
        tiles.map((tile) => {
          const { icon, links, title } = tile;
          const handleClick = () => {
            if (tile.href) {
              window.location.href = tile.href; // Navigate to href if exists
            }
          };

          return (
            <section className="flex flex-wrap gap-x-16 lg:gap-x-24 gap-y-16 mt-4">
              {tiles &&
                tiles.map((tile) => {
                  const { icon, links, title } = tile;
                  const handleClick = () => {
                    if (tile.href) {
                      window.location.href = tile.href; // Navigate to href if exists
                    }
                  };

                  return (
                    <div
                      key={title}
                      className="dashboard-tile-container"
                      onClick={handleClick}
                      role="button" // Added ARIA role for button functionality
                      aria-label={title} // Added ARIA label for screen reader accessibility
                    >
                      <h2 className="flex items-center m-0">
                        {icon}
                        <div className="ml-2">{title}</div>
                      </h2>
                      <p className="mt-6 mb-0">{tile.content}</p>
                      {typeof links === "object" &&
                        links.map((link, i) => {
                          return (
                            <a
                              key={i}
                              href={link.href}
                              id={`${title.split(" ").join("-")}-link`}
                              className={`flex items-center mt-6 no-underline font-bold`}
                            >
                              {link.title}
                            </a>
                          );
                        })}
                    </div>
                  );
                })}
            </section>
          );
        })}
    </section>
  );
}
