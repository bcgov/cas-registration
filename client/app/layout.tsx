import styles from "@/styles/layout.module.css";
import "@/styles/globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry";

/*UI component that is shared between multiple pages in an application.
It allows us to define a common structure and appearance for a group of pages, reducing redundancy and promoting code reusability*/
export default function RootLayout(props: React.PropsWithChildren) {
  return (
    // Wrap the content in the ReduxProvider to provide access to Redux state
    <html lang="en">
      <ThemeRegistry>
        <body>
          {/* Create a container with styles for layout */}
          {/* Main content area */}
          <main>{props.children}</main>
        </body>
      </ThemeRegistry>
    </html>
  );
}
