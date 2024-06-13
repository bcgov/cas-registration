import { ContentItem, IconMap } from "./types";
import { Inbox, Layers, Pulse, Users, Wrench } from "@bciers/components/icons";

const iconMap: IconMap = {
  Inbox,
  Layers,
  Pulse,
  Wrench,
  Users,
};

const Tile = ({ content, href, icon, links, title }: ContentItem) => {
  return (
    <div
      className="dashboard-tile-container p-0 min-h-[240px] h-fit py-6"
      aria-label={title} // Added ARIA label for screen reader accessibility
    >
      <a href={href} className="px-6 no-underline">
        <h2 className="flex items-center m-0">
          {iconMap[icon as keyof IconMap]?.()}
          <div className="ml-3">{title}</div>
        </h2>
        <div className="text-black mt-4">{content}</div>
      </a>
      {links && (
        <div className="flex flex-col mt-6">
          {links &&
            links.map((link) => {
              const { title: linkTitle, href: linkHref } = link;
              return (
                <div className="w-full px-6 py-2 ">
                  <a
                    key={linkTitle}
                    href={linkHref}
                    className="dashboard-tile-link no-underline"
                  >
                    {linkTitle}
                  </a>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Tile;
