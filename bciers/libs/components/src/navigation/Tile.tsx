import { ContentItem, IconMap, LinkItem } from "@bciers/types/tiles";
import {
  File,
  Inbox,
  Entrance,
  Layers,
  Pulse,
  Users,
  Wrench,
} from "@bciers/components/icons";

const iconMap: IconMap = {
  File,
  Inbox,
  Entrance,
  Layers,
  Pulse,
  Wrench,
  Users,
};

const Tile = ({
  content,
  href,
  icon,
  links,
  title,
  target,
  rel,
}: ContentItem) => {
  return (
    <div
      className="dashboard-tile-container p-0 min-h-[240px] h-fit py-6"
      aria-label={title} // Added ARIA label for screen reader accessibility
    >
      <a
        href={href}
        className="px-6 no-underline text-bc-text"
        {...(target && { target })}
        {...(rel && { rel })}
      >
        <h2 className="flex items-center m-0 [&>svg]:min-w-6">
          {iconMap[icon as keyof IconMap]}
          <div
            className="ml-3"
            dangerouslySetInnerHTML={{ __html: title }}
          ></div>
        </h2>
        <div className=" mt-4">{content}</div>
      </a>
      {links && (
        <div className="flex flex-col mt-6">
          {links &&
            links.map((link: LinkItem) => {
              const {
                title: linkTitle,
                href: linkHref,
                target: linkTarget,
                rel: linkRel,
              } = link;
              return (
                <div className="w-full px-6 py-2 " key={linkTitle}>
                  <a
                    key={linkTitle}
                    href={linkHref}
                    className="dashboard-tile-link no-underline"
                    {...(linkTarget && { target: linkTarget })}
                    {...(linkRel && { rel: linkRel })}
                  >
                    <span dangerouslySetInnerHTML={{ __html: linkTitle }} />
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
