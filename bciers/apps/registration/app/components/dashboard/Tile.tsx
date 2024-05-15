const Tile = ({
  description,
  href,
  links,
  title,
}: {
  description?: string;
  href?: string;
  links?: { title: string; href: string }[];
  title: string;
}) => {
  if (!href && links?.length === 0) {
    throw new Error("Tile must have an href or links");
  }

  // If the tile has an href, return a tile wrapped with an anchor tag
  if (href) {
    return (
      <a
        key={title}
        href={href}
        className="dashboard-tile-container no-underline cursor-pointer min-h-[200px] justify-start"
      >
        <h2 className="flex items-center m-0">
          <div>{title}</div>
        </h2>
        <div className="text-black mt-4">{description}</div>
      </a>
    );
  }

  return (
    <div key={title} className="dashboard-tile-container">
      <h2 className="flex items-center m-0">
        <div>{title}</div>
      </h2>
      <div className="flex flex-col mt-2">
        {links &&
          links.map((link) => {
            const { title, href } = link;
            return (
              <a
                key={title}
                href={href}
                className="dashboard-tile-link no-underline cursor-pointer"
              >
                {title}
              </a>
            );
          })}
      </div>
    </div>
  );
};

export default Tile;
