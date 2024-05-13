import { loadJson } from "@bciers/actions/server";
// 📐 type for ContentItem used to build dashboard content tiles
type ContentItem = {
  title: string;
  icon: string;
  content: string;
  links?: { title?: string; href: string; notification?: string }[];
};

async function buildContent(tiles: string[]): Promise<ContentItem[]> {
  const contents: ContentItem[] = [];

  for (const tile of tiles) {
    try {
      // Load JSON data asynchronously using loadJson
      const content = await loadJson(tile);

      // Assuming the loaded JSON data has the structure of ContentItem
      const contentItem: ContentItem = {
        title: content.title,
        icon: content.icon,
        content: content.content,
        links: content.links,
      };

      // Push content to the array
      contents.push(contentItem);
    } catch (error) {
      console.error(`Error loading JSON data for tile "${tile}":`, error);
      // Handle loading errors (e.g., display an error message in the div)
      contents.push({
        title: `Error: Failed to load content for "${tile}"`,
        icon: "",
        content: "",
        links: [],
      });
    }
  }

  return contents;
}
export default async function Tiles({ tiles }: { tiles: string[] }) {
  const contents = await buildContent(tiles);

  return (
    <section className="flex flex-wrap gap-x-16 lg:gap-x-24 gap-y-16 mt-4">
      {contents.map((content, index) => (
        <div key={index} className="dashboard-tile-container">
          <div className="ml-2">{content.title}</div>
        </div>
      ))}
    </section>
  );
}
