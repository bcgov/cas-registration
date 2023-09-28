import "@/styles/globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry";

/*UI component that is shared between multiple pages in an application.
It allows us to define a common structure and appearance for a group of pages, reducing redundancy and promoting code reusability*/
export default function RootLayout(props: React.PropsWithChildren) {
  return (
    <html lang="en">
      <ThemeRegistry>
        <body>
          <main>{props.children}</main>
        </body>
      </ThemeRegistry>
    </html>
  );
}
