const Tile = ({
  content,
  path,
  links,
  title,
}: {
  content?: string;
  path?: string;
  links?: { title: string; href: string }[];
  title: string;
}) => {
  if (!path && links?.length === 0) {
    throw new Error("Tile must have an href or links");
  }

  // TODO: refactor these to be more DRY
  // If the tile has an href, return a tile wrapped with an anchor tag
  if (path) {
    return (
      <a
        key={title}
        href={path}
        className="dashboard-tile-container no-underline cursor-pointer justify-start min-h-[240px] h-fit"
      >
        <h2 className="flex items-center m-0">
          <div>{title}</div>
        </h2>
        <div className="text-black mt-4">{content}</div>
      </a>
    );
  }

  return (
    <div
      key={title}
      className="dashboard-tile-container p-0 min-h-[240px] h-fit"
    >
      <div className="p-6">
        <h2 className="flex items-center m-0 text-bc-link-blue">
          <div>{title}</div>
        </h2>
        <div className="text-black mt-4">{content}</div>
      </div>
      <div className="flex flex-col mt-2">
        {links &&
          links.map((link) => {
            const { title, href } = link;
            return (
              <div className="w-full px-6 py-2 border-0 border-t border-solid ">
                <a
                  key={title}
                  href={href}
                  className="dashboard-tile-link no-underline cursor-pointer"
                >
                  {title}
                </a>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Tile;
